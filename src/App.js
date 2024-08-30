import React, { useState, useCallback, useEffect } from 'react';
import 'image-comparison-component/image-comparison.js';
import './App.css';

function App() {
  const [variant, setVariant] = useState('slider');
  const [direction, setDirection] = useState('ltr');
  const [beforeImage, setBeforeImage] = useState('https://picsum.photos/id/40/800/600');
  const [afterImage, setAfterImage] = useState('https://picsum.photos/id/40/800/600?grayscale');
  const [beforeSize, setBeforeSize] = useState(0);
  const [afterSize, setAfterSize] = useState(0);
  const [compressionPercentage, setCompressionPercentage] = useState(null);
  const [beforeFilename, setBeforeFilename] = useState('original.jpg');
  const [afterFilename, setAfterFilename] = useState('compressed.jpg');
  const [isHoveringBefore, setIsHoveringBefore] = useState(false);
  const [isHoveringAfter, setIsHoveringAfter] = useState(false);

  useEffect(() => {
    if (beforeSize > 0 && afterSize > 0) {
      const percentage = (afterSize / beforeSize) * 100;
      setCompressionPercentage(percentage);
    }
  }, [beforeSize, afterSize]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));

    if (files.length === 2) {
      // Handle two images dropped at once
      const rawImage = files.find(file => file.name.toLowerCase().includes('raw'));
      const otherImage = files.find(file => file !== rawImage);

      if (rawImage && otherImage) {
        processImage(rawImage, 'before');
        processImage(otherImage, 'after');
      } else {
        // If no "raw" image is found, process as before
        processImage(files[0], 'before');
        processImage(files[1], 'after');
      }
    } else if (files.length === 1) {
      // Handle single image drop (previous behavior)
      processImage(files[0], type);
    }
  }, []);

  const processImage = useCallback((file, type) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === 'before') {
        setBeforeImage(event.target.result);
        setBeforeSize(file.size / 1024);
        setBeforeFilename(file.name);
      } else {
        setAfterImage(event.target.result);
        setAfterSize(file.size / 1024);
        setAfterFilename(file.name);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const getOriginalLabel = () => {
    return `${beforeFilename} (${beforeSize.toFixed(2)} KB)`;
  };

  const getCompressedLabel = () => {
    if (compressionPercentage === null) {
      return `${afterFilename} (${afterSize.toFixed(2)} KB)`;
    }
    const percentageText = compressionPercentage > 100
      ? `${(compressionPercentage - 100).toFixed(0)}% larger`
      : `${(100 - compressionPercentage).toFixed(0)}% smaller`;
    return `${afterFilename} (${afterSize.toFixed(2)} KB, ${percentageText})`;
  };

  const handleDragEnter = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'before') {
      setIsHoveringBefore(true);
    } else {
      setIsHoveringAfter(true);
    }
  }, []);

  const handleDragLeave = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'before') {
      setIsHoveringBefore(false);
    } else {
      setIsHoveringAfter(false);
    }
  }, []);

  return (
    <div className="App">
      <h1>Image Comparison Demo</h1>

      <div className="controls">
        <div className="control-group">
          <h2>Variant</h2>
          <label>
            <input
              type="radio"
              value="slider"
              checked={variant === 'slider'}
              onChange={(e) => setVariant(e.target.value)}
            />
            Slider
          </label>
          <label>
            <input
              type="radio"
              value="overlay"
              checked={variant === 'overlay'}
              onChange={(e) => setVariant(e.target.value)}
            />
            Overlay
          </label>
          <label>
            <input
              type="radio"
              value="split"
              checked={variant === 'split'}
              onChange={(e) => setVariant(e.target.value)}
            />
            Split view
          </label>
        </div>

        <div className="control-group">
          <h2>Reading direction</h2>
          <label>
            <input
              type="radio"
              value="ltr"
              checked={direction === 'ltr'}
              onChange={(e) => setDirection(e.target.value)}
            />
            ltr
          </label>
          <label>
            <input
              type="radio"
              value="rtl"
              checked={direction === 'rtl'}
              onChange={(e) => setDirection(e.target.value)}
            />
            rtl
          </label>
        </div>
      </div>

      <image-comparison variant={variant} direction={direction}>
        <label slot="label-before">{getOriginalLabel()}</label>
        <label slot="label-after">{getCompressedLabel()}</label>
        <img slot="image-before" src={beforeImage} alt="Original" />
        <img slot="image-after" src={afterImage} alt="Compressed" />
      </image-comparison>

      <div className="drop-zones">
        <div
          className={`drop-zone ${isHoveringBefore ? 'hovering' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, 'before')}
          onDragLeave={(e) => handleDragLeave(e, 'before')}
          onDrop={(e) => handleDrop(e, 'before')}
        >
          <h3>Before Image</h3>
          <input
            type="file"
            id="before-image"
            accept="image/*"
            onChange={(e) => processImage(e.target.files[0], 'before')}
          />
          <label htmlFor="before-image">Drop or select Before image</label>
        </div>
        <div
          className={`drop-zone ${isHoveringAfter ? 'hovering' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, 'after')}
          onDragLeave={(e) => handleDragLeave(e, 'after')}
          onDrop={(e) => handleDrop(e, 'after')}
        >
          <h3>After Image</h3>
          <input
            type="file"
            id="after-image"
            accept="image/*"
            onChange={(e) => processImage(e.target.files[0], 'after')}
          />
          <label htmlFor="after-image">Drop or select After image</label>
        </div>
      </div>
    </div>
  );
}

export default App;
