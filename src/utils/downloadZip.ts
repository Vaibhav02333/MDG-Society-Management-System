export const downloadFullProjectZip = async () => {
  try {
    const response = await fetch('/MDG_Society_Management_System.zip');
    if (!response.ok) throw new Error('File fetch failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MDG_Society_Management_System.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    console.warn('Falling back to direct anchor link download:', err);
    const link = document.createElement('a');
    link.href = '/MDG_Society_Management_System.zip';
    link.download = 'MDG_Society_Management_System.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

