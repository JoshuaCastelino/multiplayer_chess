import axios from "axios";

const PORT = 5104
const API_URL = `http://localhost:${PORT}`;
console.log(API_URL)
export const testAPI = async () => {
  try {
    const response = await axios.get(`${API_URL}/test`);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return [];
  }
};