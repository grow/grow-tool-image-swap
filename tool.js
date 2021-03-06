(function(grow){
  grow = grow || {};
  grow.ui = grow.ui || {};
  grow.ui.tools = grow.ui.tools || [];

  var hasInitialized = false;
  var isActive = false;
  var styleBackgroundRegex = /background(-image)?/i;

  var onDrop = function(e) {
    if (!isActive) {
      return;
    }

    e.preventDefault();

    var style;
    var target = {
      element: e.target,
      type: null
    };

    do {
      // Check if the target is an image.
      if (/img/i.test(target.element.tagName)) {
        target.type = 'img';
        break;
      }

      // Check for a background-image.
      style = window.getComputedStyle(target.element, false);
      if (style && style.backgroundImage != 'none') {
        target.type = 'background';
        break;
      }

      // Check for a :after background-image.
      style = window.getComputedStyle(target.element, '::after');
      if (style && style.backgroundImage != 'none') {
        target.type = 'after';
        break;
      }

      // Check for a :before background-image.
      style = window.getComputedStyle(target.element, '::before');
      if (style && style.backgroundImage != 'none') {
        target.type = 'before';
        break;
      }

      target.element = target.element.parentNode;
    } while (target.element && target.element instanceof HTMLElement);

    if (!target.element) {
      console.error('Unable to find a related image to replace.');
      return;
    }

    var dt = e.dataTransfer;
    var file;
    if (dt.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i=0; i < dt.items.length; i++) {
        if (dt.items[i].kind == "file") {
          file = dt.items[i].getAsFile();
          break; // Only need one file.
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i=0; i < dt.files.length; i++) {
        file = dt.files[i];
        break; // Only need one file.
      }
    }

    fileReader = new FileReader();

    fileReader.onload = function(fileResults) {
      switch (target.type) {
        case 'img':
          target.element.src = fileResults.target.result;
          break;
        case 'after':
        case 'before':
          console.error(
            'Cannot replace images that are part of pseduo selectors (ex: ::after or ::before).');
          break;
        case 'background':
          target.element.style.backgroundImage = 'url(' + fileResults.target.result + ')';
          break;
        default:
          console.error('Unsupported type of drop target.');
      }
    }

    fileReader.readAsDataURL(file);
  };

  var onDragEnd = function(e) {
    if (!isActive) {
      return;
    }

    // Remove all of the drag data.
    var dt = e.dataTransfer;
    if (dt.items) {
      for (var i = 0; i < dt.items.length; i++) {
        dt.items.remove(i);
      }
    } else {
      dt.clearData();
    }
  };

  var onDragOver = function(e) {
    if (!isActive) {
      return;
    }

    e.preventDefault();
  };

  var triggerTool = function() {
    document.body.classList.toggle('grow_tool__image_swap--active');
    isActive = !isActive;

    if (!hasInitialized) {
      hasInitialized = true;

      document.body.addEventListener("drop", onDrop);
      document.body.addEventListener("dragover", onDragOver);
      document.body.addEventListener("dragend", onDragEnd);

      var notice = grow.ui.showNotice('Drag and drop new images to preview.');
      notice.classList.add('grow_tool__image_swap__notice');
    }
  };

  grow.ui.tools.push({
    'kind': 'image-swap',
    'name': 'Image Swap',
    'button': {
      'events': {
        'click': triggerTool
      }
    }
  });
})(grow || window.grow);
