// JavaScript to add video background to hero section
document.addEventListener('DOMContentLoaded', function() {
    // Get the hero section
    const heroSection = document.getElementById('hero');
    
    if (!heroSection) return;
    
    // Create video element
    const videoElement = document.createElement('video');
    videoElement.id = 'hero-video';
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    
    // Add source element
    const sourceElement = document.createElement('source');
    sourceElement.src = 'cafe video.mp4';
    sourceElement.type = 'video/mp4';
    
    // Add source to video
    videoElement.appendChild(sourceElement);
    
    // Create overlay
    const overlayElement = document.createElement('div');
    overlayElement.className = 'video-overlay';
    
    // Get or create hero-background
    let heroBackground = heroSection.querySelector('.hero-background');
    
    if (!heroBackground) {
        // Create new hero-background if it doesn't exist
        heroBackground = document.createElement('div');
        heroBackground.className = 'hero-background';
        
        // Insert at the beginning of hero section
        heroSection.insertBefore(heroBackground, heroSection.firstChild);
    } else {
        // Clear existing hero-background content
        heroBackground.innerHTML = '';
    }
    
    // Add video and overlay to hero-background
    heroBackground.appendChild(videoElement);
    heroBackground.appendChild(overlayElement);
    
    // Add CSS for video and overlay
    const style = document.createElement('style');
    style.textContent = `
        #hero {
            position: relative;
            overflow: hidden;
        }
        
        .hero-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        
        #hero-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
        }
        
        .video-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7));
            z-index: 2;
        }
        
        .hero-content {
            position: relative;
            z-index: 3;
        }
        
        .hero-shape {
            z-index: 3;
        }
    `;
    
    // Add style to document head
    document.head.appendChild(style);
    
    console.log('Video background added to hero section');
}); 