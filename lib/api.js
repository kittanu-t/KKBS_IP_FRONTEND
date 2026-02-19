const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function predict(data) {
  console.log("➡️ POST:", `${API_URL}/predict`);
  console.log("➡️ BODY:", data);

  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log("⬅️ STATUS:", res.status);

  const json = await res.json();

  console.log("⬅️ JSON:", json);

  return json;
}
