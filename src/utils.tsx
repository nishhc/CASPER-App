export function downloadCSV(csvString: string, fileName: string = "ranked.csv") {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}
