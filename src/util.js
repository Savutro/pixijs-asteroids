// Dialoge generieren
function showDialog(message, callback) {
  const dialog = document.createElement('div');
  dialog.style.position = 'absolute';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.padding = '20px';
  dialog.style.background = '#ffffff';
  dialog.style.border = '2px solid #000000';
  dialog.style.textAlign = 'center';
  dialog.textContent = message;

  const reloadButton = document.createElement('button');
  reloadButton.textContent = 'Reload Page';
  reloadButton.addEventListener('click', callback);

  dialog.appendChild(reloadButton);
  document.body.appendChild(dialog);
}