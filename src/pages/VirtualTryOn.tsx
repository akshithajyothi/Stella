import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';

// Predefined catalog outfits for quick try-on
const catalogOutfits = [
  { id: 1, name: 'Shirt', src: '/sample-dress.jpg', category: 'Tops' },
  { id: 2, name: 'Casual Pink Top', src: '/pinktop.png', category: 'Tops' },
  { id: 3, name: 'Classic Striped Shirt', src: '/stripes.png', category: 'Tops' },
  { id: 4, name: 'formal Shirt', src: '/shirt.png', category: 'Tops' },
  { id: 5, name: 'Grey Minimalist Top', src: '/greytop.png', category: 'Tops' },
  { id: 6, name: 'Knitted sweater', src: 'https://i.pinimg.com/736x/9e/89/ad/9e89ad8075b8f24357adb71c7a901d09.jpg', category: 'Sweater' },
  { id: 7, name: 'Trouser pant', src: 'https://i.pinimg.com/736x/1b/7f/6c/1b7f6ce41319b52ccebe58d95f103a21.jpg', category: 'Trouser' },
  { id: 8, name: 'Elegant bodycon dress', src: 'https://i.pinimg.com/1200x/25/2a/0d/252a0d87c71ed4b187dd7d3451447e51.jpg', category: 'Dress' }
];

const VISIBLE = 4;

type PuterImage = HTMLImageElement | string | { src?: string };

type PuterGlobal = {
  ai?: {
    txt2img: (prompt: string, options: {
      provider: string;
      model: string;
      input_images: string[];
    }) => Promise<PuterImage>;
  };
};

const getPuter = (): PuterGlobal | null => {
  const puter = (window as Window & { puter?: PuterGlobal }).puter;
  return puter?.ai?.txt2img ? puter : null;
};

const VirtualTryOn = () => {
  const location = useLocation();
  const locationState = location.state as { garmentImage?: string; garmentName?: string } | null;

  // Studio State
  const [personDataUrl, setPersonDataUrl] = useState<string>('');
  const [personFileName, setPersonFileName] = useState<string>('');

  const [dressDataUrl, setDressDataUrl] = useState<string>('');
  const [dressName, setDressName] = useState<string>('');

  // Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [resultImageUrl, setResultImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isPuterReady, setIsPuterReady] = useState<boolean>(() => Boolean(getPuter()));
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState<boolean>(false);

  // Carousel
  const [carouselIndex, setCarouselIndex] = useState(0);
  const studioRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);
  const dressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPuterReady) return;

    const checkPuter = () => {
      if (getPuter()) {
        setIsPuterReady(true);
        // Check if user is authenticated with Puter
        const puter = (window as any).puter;
        if (puter && !puter.auth?.isSignedIn) {
          console.log('Puter loaded but user not signed in');
        }
      }
    };
    checkPuter();
    const intervalId = window.setInterval(checkPuter, 250);
    return () => window.clearInterval(intervalId);
  }, [isPuterReady]);

  // Check if passed from another page (e.g. Product.tsx)
  useEffect(() => {
    if (locationState?.garmentImage) {
      handleSelectOutfit(locationState.garmentImage, locationState.garmentName || 'Selected Product');
    }
  }, [locationState]);

  // Convert File to Data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  };

  // Convert Image URL to Data URL (for catalog items)
  const urlToDataURL = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      // Fallback: draw on canvas for cross-origin images if needed
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
          } else {
            resolve(url);
          }
        };
        img.onerror = () => resolve(url); // return as is if canvas fails
        img.src = url;
      });
    }
  };

  // Handle Person Upload
  const handlePersonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPersonFileName(file.name);
      try {
        const dataUrl = await fileToDataURL(file);
        setPersonDataUrl(dataUrl);
        setErrorMessage('');
      } catch (err: any) {
        setErrorMessage(err.message || 'Error loading person image');
      }
    }
  };

  // Handle Dress Upload
  const handleDressUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDressName(file.name);
      try {
        const dataUrl = await fileToDataURL(file);
        setDressDataUrl(dataUrl);
        setErrorMessage('');
      } catch (err: any) {
        setErrorMessage(err.message || 'Error loading dress image');
      }
    }
  };

  // Quick Sample Person
  const handleUseSamplePerson = async () => {
    setPersonFileName('Sample Person');
    try {
      const dataUrl = await urlToDataURL('/sample-person.jpg');
      setPersonDataUrl(dataUrl);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage('Could not load sample person image: ' + err.message);
    }
  };

  // Quick Sample Dress
  const handleUseSampleDress = async () => {
    setDressName('Sample Dress');
    try {
      const dataUrl = await urlToDataURL('/sample-dress.jpg');
      setDressDataUrl(dataUrl);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage('Could not load sample dress image: ' + err.message);
    }
  };

  // Select Outfit from Carousel
  const handleSelectOutfit = async (imgSrc: string, name: string) => {
    setDressName(name);
    try {
      const dataUrl = await urlToDataURL(imgSrc);
      setDressDataUrl(dataUrl);
      setErrorMessage('');
      // Smoothly scroll to the studio
      studioRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setDressDataUrl(imgSrc);
    }
  };

  // Trigger AI Virtual Try-On
  const handleGenerateTryOn = async () => {
    if (!personDataUrl) {
      setErrorMessage('Please upload or select a person image first.');
      return;
    }
    if (!dressDataUrl) {
      setErrorMessage('Please select or upload a dress image to try on.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setStatusMessage('Reading images and preparing AI model...');
    setResultImageUrl('');

    try {
      const puter = getPuter();
      if (!puter?.ai) {
        throw new Error('Puter AI is unavailable. Check your internet connection and reload the page.');
      }

      // Always prompt for sign-in on the first generation attempt
      const puterGlobal = (window as any).puter;
      if (puterGlobal && puterGlobal.auth) {
        if (!hasGeneratedOnce) {
          // First time generating - always show sign-in prompt
          setStatusMessage('Requesting Puter authentication...');
          try {
            await puterGlobal.auth.signIn();
            setStatusMessage('Authentication successful! Proceeding with generation...');
            setHasGeneratedOnce(true);
          } catch (authError: any) {
            setIsGenerating(false);
            throw new Error('Puter authentication required. Please sign in to use AI features.');
          }
        } else if (!puterGlobal.auth.isSignedIn) {
          // Subsequent attempts - only prompt if not signed in
          setStatusMessage('Requesting Puter authentication...');
          try {
            await puterGlobal.auth.signIn();
            setStatusMessage('Authentication successful! Proceeding with generation...');
          } catch (authError: any) {
            setIsGenerating(false);
            throw new Error('Puter authentication required. Please sign in to use AI features.');
          }
        }
      }

      setStatusMessage('Analyzing body pose and outfit features...');

      const prompt = `
Create a realistic virtual try-on image.

The FIRST image is the PERSON.
The SECOND image is the DRESS.

Put the exact dress from the SECOND image onto the person in the FIRST image.

IMPORTANT:
- Keep the person's face unchanged.
- Keep the person's identity unchanged.
- Keep the person's hairstyle unchanged.
- Keep the person's body proportions unchanged.
- Keep the person's pose as natural as possible.
- Replace the existing clothing with the dress.
- Preserve the dress's exact color.
- Preserve the dress's pattern.
- Preserve the dress's design.
- Preserve the fabric appearance.
- Make the dress fit naturally.
- Add realistic folds and shadows.
- Make the result photorealistic.
- Do not create a different person.
- Do not modify the person's face.

The final image should look like a real photograph of the person wearing the supplied dress.
      `;

      setStatusMessage('✨ Generating AI Virtual Try-On ');

      const generatedImage = await puter.ai.txt2img(prompt, {
        provider: 'gemini',
        model: 'nano-banana-pro',
        input_images: [personDataUrl, dressDataUrl]
      });

      const finalUrl = typeof generatedImage === 'string'
        ? generatedImage
        : generatedImage?.src || '';

      if (!finalUrl) {
        throw new Error('No image URL was returned by the AI provider.');
      }

      setResultImageUrl(finalUrl);
      setStatusMessage('Image generated successfully!');

      // Auto-scroll down to result after a short delay
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (error: any) {
      console.error('Virtual Try-On Error:', error);
      
      // Better error messages
      let errorMsg = error.message || 'An error occurred while generating the virtual try-on.';
      
      if (errorMsg.includes('auth') || errorMsg.includes('sign')) {
        errorMsg = 'Authentication required: Please sign in to Puter to use AI features. Refresh the page and try again.';
      } else if (errorMsg.includes('balance') || errorMsg.includes('funding') || errorMsg.includes('credit')) {
        errorMsg = '💳 Insufficient Credits: Your Puter account needs funding to use AI features. Please visit puter.com to add credits to your account. Typical cost is $0.01-0.05 per generation.';
      } else if (errorMsg.includes('upgrade')) {
        errorMsg = '💳 Account Upgrade Required: Please visit puter.com to upgrade your account or add credits for AI image generation.';
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        errorMsg = 'Network error: Please check your internet connection and try again.';
      } else if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
        errorMsg = 'API limit reached: You may have exceeded your Puter AI usage quota.';
      }
      
      setErrorMessage(errorMsg);
      setStatusMessage('');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Generated Image
  const handleDownload = () => {
    if (!resultImageUrl) return;
    const a = document.createElement('a');
    a.href = resultImageUrl;
    a.download = `restyle-virtual-tryon-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const prevSlide = () => setCarouselIndex(i => Math.max(0, i - 1));
  const nextSlide = () => setCarouselIndex(i => Math.min(catalogOutfits.length - VISIBLE, i + 1));

  return (
    <>
      <Header />

      <div className="section virtual-tryon-page">
        {/* HERO HEADER */}
        <div className="tryon-hero-header">
          <span className="tryon-badge-pill">
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI Powered Studio
          </span>
          <h1>Virtual Try-On Studio</h1>
          <p className="tryon-subtitle">
            Upload your photo, select any outfit, and preview a realistic AI-generated fit in seconds.
          </p>
        </div>

        {/* HOW IT WORKS */}
        <div className="how-section">
          <h2 className="how-title">How It Works</h2>
          <div className="how-grid">
            <div className="how-card">
              <div className="how-icon">
                <i className="fa-solid fa-user"></i>
              </div>
              <h3>1. Upload Photo</h3>
              <p>Upload a clear full-body or upper-body photo of yourself.</p>
            </div>

            <div className="how-card">
              <div className="how-icon">
                <i className="fa-solid fa-shirt"></i>
              </div>
              <h3>2. Select Outfit</h3>
              <p>Choose an item from our curated rack or upload your own dress.</p>
            </div>

            <div className="how-card">
              <div className="how-icon">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h3>3. AI Fit Magic</h3>
              <p>AI seamlessly merges the outfit with realistic folds & lighting.</p>
            </div>
          </div>
        </div>

        {/* AI TRY-ON STUDIO WORKSPACE */}
        <div className="tryon-studio-container" ref={studioRef}>
          <div className="tryon-studio-header">
            <h2><i className="fa-solid fa-sliders"></i> Try-On Workspace</h2>
            <p>Provide your person image and garment to begin synthesis</p>
            
            {/* Puter Status Indicator */}
            {!isPuterReady && (
              <div className="tryon-error-banner" style={{ marginTop: '1rem' }}>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <span>Loading Puter AI service...</span>
              </div>
            )}
          </div>

          <div className="tryon-inputs-grid">
            {/* PERSON UPLOAD CARD */}
            <div className={`tryon-card ${personDataUrl ? 'has-media' : ''}`}>
              <div className="tryon-card-header">
                <span className="step-num">Step 1</span>
                <h3>Person Photo</h3>
              </div>

              {personDataUrl ? (
                <div className="tryon-preview-box">
                  <img src={personDataUrl} alt="Person Preview" className="tryon-preview-img" />
                  <div className="tryon-preview-overlay">
                    <span className="file-tag"><i className="fa-solid fa-check"></i> {personFileName || 'Photo loaded'}</span>
                    <button
                      className="tryon-replace-btn"
                      onClick={() => personInputRef.current?.click()}
                    >
                      <i className="fa-solid fa-arrows-rotate"></i> Change Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="tryon-dropzone"
                  onClick={() => personInputRef.current?.click()}
                >
                  <div className="dropzone-icon">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <h4>Upload Your Photo</h4>
                  <p>PNG, JPG, WEBP up to 10MB</p>
                  <button type="button" className="tryon-upload-btn">Browse Files</button>
                  <button
                    type="button"
                    className="tryon-sample-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseSamplePerson();
                    }}
                  >
                    <i className="fa-solid fa-wand-sparkles"></i> Use Sample Model
                  </button>
                </div>
              )}

              <input
                ref={personInputRef}
                type="file"
                accept="image/*"
                onChange={handlePersonUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* PLUS / CONNECTOR ICON */}
            <div className="tryon-connector">
              <div className="connector-circle">
                <i className="fa-solid fa-plus"></i>
              </div>
            </div>

            {/* DRESS UPLOAD / SELECT CARD */}
            <div className={`tryon-card ${dressDataUrl ? 'has-media' : ''}`}>
              <div className="tryon-card-header">
                <span className="step-num">Step 2</span>
                <h3>Outfit / Dress</h3>
              </div>

              {dressDataUrl ? (
                <div className="tryon-preview-box">
                  <img src={dressDataUrl} alt="Dress Preview" className="tryon-preview-img" />
                  <div className="tryon-preview-overlay">
                    <span className="file-tag"><i className="fa-solid fa-check"></i> {dressName || 'Dress loaded'}</span>
                    <button
                      className="tryon-replace-btn"
                      onClick={() => dressInputRef.current?.click()}
                    >
                      <i className="fa-solid fa-arrows-rotate"></i> Change Dress
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="tryon-dropzone"
                  onClick={() => dressInputRef.current?.click()}
                >
                  <div className="dropzone-icon">
                    <i className="fa-solid fa-shirt"></i>
                  </div>
                  <h4>Upload Dress / Top</h4>
                  <p>Or select one from the rack below</p>
                  <button type="button" className="tryon-upload-btn">Browse Garment</button>
                  <button
                    type="button"
                    className="tryon-sample-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseSampleDress();
                    }}
                  >
                    <i className="fa-solid fa-wand-sparkles"></i> Use Sample Dress
                  </button>
                </div>
              )}

              <input
                ref={dressInputRef}
                type="file"
                accept="image/*"
                onChange={handleDressUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="tryon-error-banner">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STATUS NOTIFIER */}
          {statusMessage && (
            <div className="tryon-status-bar">
              {isGenerating && <div className="tryon-spinner"></div>}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* ACTION BUTTON */}
          <div className="tryon-action-row">
            <button
              className={`tryon-generate-btn ${isGenerating ? 'loading' : ''}`}
              onClick={handleGenerateTryOn}
              disabled={isGenerating || !personDataUrl || !dressDataUrl}
            >
              {isGenerating ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Generating Try-On...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Generate AI Virtual Fit
                </>
              )}
            </button>
          </div>
        </div>

        {/* RESULT PRESENTATION SECTION */}
        {resultImageUrl && (
          <div className="tryon-result-section" ref={resultRef}>
            <div className="result-card">
              <div className="result-header">
                <div>
                  <span className="result-badge">
                    <i className="fa-solid fa-circle-check"></i> Synthesis Complete
                  </span>
                  <h2>Your Virtual Try-On Result</h2>
                </div>
                <div className="result-actions">
                  <button className="download-btn" onClick={handleDownload}>
                    <i className="fa-solid fa-download"></i> Download Look
                  </button>
                </div>
              </div>

              <div className="result-showcase">
                <div className="result-image-wrapper">
                  <img src={resultImageUrl} alt="AI Virtual Try-On Output" className="result-main-img" />
                </div>

                <div className="result-sidebar">
                  <h3>Outfit Breakdown</h3>
                  <div className="breakdown-item">
                    <div className="breakdown-thumb">
                      <img src={personDataUrl} alt="Person" />
                    </div>
                    <div>
                      <strong>Original Model</strong>
                      <p>Pose & features preserved</p>
                    </div>
                  </div>

                  <div className="breakdown-item">
                    <div className="breakdown-thumb">
                      <img src={dressDataUrl} alt="Dress" />
                    </div>
                    <div>
                      <strong>Applied Outfit</strong>
                      <p>{dressName || 'Custom Garment'}</p>
                    </div>
                  </div>

                  <div className="result-tips">
                    <i className="fa-solid fa-lightbulb"></i>
                    <span>
                      Love this look? Download it to share or explore similar items in our curated thrift rack!
                    </span>
                  </div>

                  <button
                    className="tryon-reset-btn"
                    onClick={() => {
                      setResultImageUrl('');
                      studioRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <i className="fa-solid fa-rotate-left"></i> Try Another Style
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRENDING RACK CAROUSEL */}
        <div className="tryon-catalog-section">
          <div className="catalog-header">
            <h2>Select From Trending Rack</h2>
            <p>Click "Try-On" to load any outfit directly into your studio</p>
          </div>

          <div className="outfit-carousel-wrapper">
            <button
              className="carousel-arrow carousel-arrow-left"
              onClick={prevSlide}
              disabled={carouselIndex === 0}
              aria-label="Previous Outfits"
            >
              &#8249;
            </button>
            <div className="outfit-carousel-track">
              {catalogOutfits.slice(carouselIndex, carouselIndex + VISIBLE).map((outfit) => (
                <div className={`outfit-card ${dressName === outfit.name ? 'selected-outfit' : ''}`} key={outfit.id}>
                  <div className="outfit-img-container">
                    <img src={outfit.src} alt={outfit.name} />
                    <span className="outfit-category-tag">{outfit.category}</span>
                  </div>
                  <div className="outfit-info">
                    <h4>{outfit.name}</h4>
                    <button
                      className="try-btn"
                      onClick={() => handleSelectOutfit(outfit.src, outfit.name)}
                    >
                      <i className="fa-solid fa-shirt"></i> Try-On
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="carousel-arrow carousel-arrow-right"
              onClick={nextSlide}
              disabled={carouselIndex >= catalogOutfits.length - VISIBLE}
              aria-label="Next Outfits"
            >
              &#8250;
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VirtualTryOn;
