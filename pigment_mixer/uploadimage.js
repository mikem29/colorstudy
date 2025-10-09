document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('upload-image-button');
    const modal = document.getElementById('upload-modal');
    const fileInput = document.getElementById('fileToUpload');
    const fileName = document.getElementById('file-name');
    const uploadForm = document.getElementById('upload-form');
    const imageGrid = document.getElementById('image-grid');
  
    uploadButton.addEventListener('click', function() {
      modal.style.display = 'block';
    });
  
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        fileName.textContent = this.files[0].name;
        uploadImage(this.files[0]);
      }
    });
  
    function uploadImage(file) {
      const formData = new FormData();
      formData.append('fileToUpload', file);
  
      // Create placeholder thumbnail
      const placeholderThumbnail = document.createElement('div');
      placeholderThumbnail.className = 'image-item placeholder-thumbnail';
      imageGrid.insertBefore(placeholderThumbnail, imageGrid.firstChild);
  
      // Close the modal
      modal.style.display = 'none';
  
      // Send AJAX request
      fetch('ajax_upload_image.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Replace placeholder with actual thumbnail
          placeholderThumbnail.innerHTML = `
            <a href="index.php?image_id=${data.image_id}">
              <img src="${data.thumbnail_path}" alt="Thumbnail">
            </a>
            <form action="uploadimage.php" method="post" class="delete-form">
              <input type="hidden" name="delete_image" value="${data.image_id}">
              <button type="submit" class="delete-button">Delete</button>
            </form>
          `;
          placeholderThumbnail.classList.remove('placeholder-thumbnail');
        } else {
          // Remove placeholder and show error
          placeholderThumbnail.remove();
          alert('Error uploading image: ' + data.message);
        }
      })
      .catch(error => {
        placeholderThumbnail.remove();
        console.error('Error:', error);
        alert('An error occurred while uploading the image.');
      });
    }
  
    // ... rest of the code (delete confirmation, etc.) ...
});