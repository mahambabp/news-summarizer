const axios = require("axios");

// Fetch articles from Google News API with category support
async function fetchArticles(category = "general", page = 1) {
  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      headers: { Authorization: `Bearer ${process.env.GOOGLE_NEWS_API_KEY}` },
      params: {
        country: "us", // You can change this to any other country code, e.g., 'za' for South Africa
        language: "en",
        category, // Use the category parameter dynamically
        pageSize: 6, // Display 5 articles per page
        page, // Dynamic page number for pagination
      },
    });

    return response.data.articles.map((article) => ({
      title: article.title,
      link: article.url, // Ensure the correct field is mapped for the link
      content: article.description || article.content,
    }));
  } catch (error) {
    console.error("Error fetching articles from Google News API:", error);
    throw new Error("Failed to fetch articles");
  }
}
// Summarize an article using DeepAI API
async function summarizeArticle(content) {
  try {
    const response = await axios.post(
      "https://api.deepai.org/api/summarization",
      {
        text: content, // The content to summarize
      },
      {
        headers: { "Api-Key": process.env.DEEPAI_API_KEY }, // Your DeepAI API key
      }
    );

    return response.data.output || content; // Return summary or fallback to original content
  } catch (error) {
    console.error("Error summarizing article:", error);
    return content; // Fallback to original content
  }
}

// Controller function to get and render summarized articles based on category and page
async function getSummarizedArticles(req, res) {
  const category = req.params.category || "general"; // Default to 'general' if no category is provided
  const page = parseInt(req.query.page) || 1; // Default to page 1 if no page is provided

  try {
    const articles = await fetchArticles(category, page);
    const summarizedArticles = await Promise.all(
      articles.map(async (article) => ({
        ...article,
        summary: await summarizeArticle(article.content),
      }))
    );

    res.render("index", {
      articles: summarizedArticles,
      category,
      page,
    });
  } catch (error) {
    console.error("Error getting summarized articles:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { getSummarizedArticles };
