import type { ChangeEvent } from 'react';
import Header from '../components/Header';
import { useWardrobe } from '../context/WardrobeContext';

const Wardrobe = () => {
  const { items, addItem, removeItem } = useWardrobe();

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        addItem({
          name: file.name.replace(/\.[^.]+$/, ''),
          image: reader.result as string,
          category: 'Uncategorized',
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  return (
    <>
      <Header />

      <div className="dashboard">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <h1>Wardrobe Manager</h1>

          <div className="upload-box">
            <input type="file" multiple accept="image/*" onChange={handleUpload} />
            <br /><br />
            <p>Upload clothing images from your wardrobe</p>
          </div>

          {items.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '10px 0 20px' }}>
              {items.map((item) => (
                <div key={item.id} style={{ position: 'relative', width: 70 }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    title="Remove"
                    style={{
                      position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                      borderRadius: '50%', border: 'none', background: '#a4133c', color: '#fff',
                      cursor: 'pointer', fontSize: 11, lineHeight: 1,
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <h2>Auto Categories</h2>
          <div className="categories">
            <div className="cat-card">Tops</div>
            <div className="cat-card">Bottoms</div>
            <div className="cat-card">Dresses</div>
            <div className="cat-card">Coats</div>
            <div className="cat-card">Crop Tops</div>
            <div className="cat-card">Shirts</div>
            <div className="cat-card">Jeans</div>
            <div className="cat-card">Sweatshirts</div>
          </div>

          {/* OUTFIT CALENDAR */}
          <div className="outfit-calendar-section">
            <div className="calendar-header">
              <h2>Outfit calendar</h2>
              <a href="#" className="view-calendar-link">View Calendar <i className="fa-solid fa-chevron-right"></i></a>
            </div>

            <div className="calendar-days">
              <div className="calendar-day-card">
                <div className="day-name">Mon</div>
                <div className="day-date">Oct 13</div>
                <div className="day-weather">
                  <i className="fa-solid fa-cloud-rain"></i> 25° <span className="temp-low">21°</span>
                </div>
                <div className="outfit-placeholder">
                  <i className="fa-regular fa-calendar-plus"></i>
                </div>
              </div>

              <div className="calendar-day-card">
                <div className="day-name">Tue</div>
                <div className="day-date">Oct 14</div>
                <div className="day-weather">
                  <i className="fa-solid fa-cloud-rain"></i> 18° <span className="temp-low">16°</span>
                </div>
                <div className="outfit-placeholder">
                  <i className="fa-regular fa-calendar-plus"></i>
                </div>
              </div>

              <div className="calendar-day-card">
                <div className="day-name">Wed</div>
                <div className="day-date">Oct 15</div>
                <div className="day-weather">
                  <i className="fa-solid fa-sun"></i> 22° <span className="temp-low">18°</span>
                </div>
                <div className="outfit-placeholder">
                  <i className="fa-regular fa-calendar-plus"></i>
                </div>
              </div>

              <div className="calendar-day-card">
                <div className="day-name">Thu</div>
                <div className="day-date">Oct 16</div>
                <div className="day-weather">
                  <i className="fa-solid fa-cloud-sun"></i> 24° <span className="temp-low">20°</span>
                </div>
                <div className="outfit-placeholder">
                  <i className="fa-regular fa-calendar-plus"></i>
                </div>
              </div>

              <div className="calendar-day-card">
                <div className="day-name">Fri</div>
                <div className="day-date">Oct 17</div>
                <div className="day-weather">
                  <i className="fa-solid fa-sun"></i> 26° <span className="temp-low">22°</span>
                </div>
                <div className="outfit-placeholder">
                  <i className="fa-regular fa-calendar-plus"></i>
                </div>
              </div>

              <div className="calendar-day-card">
                <div className="day-name">Sat</div>
                <div className="day-date">Oct 18</div>
                <div className="day-weather">
                  <i className="fa-solid fa-cloud"></i> 23° <span className="temp-low">19°</span>
                </div>
                <div className="outfit-placeholder">
                  <i className="fa-regular fa-calendar-plus"></i>
                </div>
              </div>

              <div className="calendar-day-card">
                <div className="day-name">Sun</div>
                <div className="day-date">Oct 19</div>
                <div className="day-weather">
                  <i className="fa-solid fa-cloud"></i> 21° <span className="temp-low">17°</span>
                </div>
                <div className="outfit-placeholder">
                  <i className="fa-regular fa-calendar-plus"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="ai-card">
            <h3>Your Personal Stylist</h3>

            <label>Occasion</label>
            <select>
              <option>Business Casual</option>
              <option>College</option>
              <option>Party</option>
            </select>

            <label>Weather</label>
            <div className="weather">
              <button>☀ Sunny</button>
              <button>☁ Cloudy</button>
              <button>🌧 Rainy</button>
            </div>

            <button className="generate-btn">Generate Outfit</button>
          </div>

          <h3>Wardrobe Insights</h3>

          <div className="insight-card">
            <img src="https://i.pinimg.com/736x/0f/42/5a/0f425a0dfb964bca6c9c215e5a2c91bb.jpg" alt="Most Worn" />
            <div>
              <b>Most Worn</b>
              <br />
              Linen Blazer
              <br />
              <span className="badge">Good</span>
            </div>
          </div>

          <div className="insight-card">
            <img src="https://i.pinimg.com/736x/aa/19/71/aa1971144c89e705c078cc2e391c28c5.jpg" alt="Least Worn" />
            <div>
              <b>Least Worn</b>
              <br />
              Evening Gown
              <br />
              <button className="suggest-btn">Suggest Ways</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Wardrobe;
