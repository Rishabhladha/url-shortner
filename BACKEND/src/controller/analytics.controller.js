import Click from "../models/click.model.js";
import wrapAsync from "../utils/tryCatchWrapper.js";
import mongoose from "mongoose";

export const getUrlAnalytics = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const objectId = new mongoose.Types.ObjectId(id);

  const totalClicks = await Click.countDocuments({ shortUrl: id });

  // Unique visitors (by IP)
  const uniqueVisitors = await Click.distinct("ipAddress", { shortUrl: objectId });

  // Aggregate by country
  const clicksByCountry = await Click.aggregate([
    { $match: { shortUrl: objectId } },
    { $group: { _id: "$country", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Aggregate by city
  const clicksByCity = await Click.aggregate([
    { $match: { shortUrl: objectId } },
    { $group: { _id: "$city", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Aggregate by browser
  const clicksByBrowser = await Click.aggregate([
    { $match: { shortUrl: objectId } },
    { $group: { _id: "$browser", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Aggregate by OS
  const clicksByOS = await Click.aggregate([
    { $match: { shortUrl: objectId } },
    { $group: { _id: "$os", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Aggregate by date (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const clicksByDate = await Click.aggregate([
    { $match: { shortUrl: objectId, timestamp: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Recent clicks (last 20)
  const recentClicks = await Click.find({ shortUrl: objectId })
    .sort({ timestamp: -1 })
    .limit(20)
    .select("country city browser os timestamp -_id")
    .lean();

  res.status(200).json({
    totalClicks,
    uniqueVisitors: uniqueVisitors.length,
    clicksByCountry,
    clicksByCity,
    clicksByBrowser,
    clicksByOS,
    clicksByDate,
    recentClicks,
  });
});

