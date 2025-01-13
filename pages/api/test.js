export default function handler(req, res) {
    try {
      res.status(200).json({ message: "API is working" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }