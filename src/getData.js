export async function getData(url = '', data = {}) {
  const response = await fetch(url + '?' + new URLSearchParams(data));
  return response.json();
}
