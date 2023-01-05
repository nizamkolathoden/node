const User = require("../schema/user.schema");
const Post = require("../schema/post.schema");
module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API

    const totalDocs = await User.countDocuments();

    let limit = Number(req.query.limit || 10);
    const page = Number(req.query.page || 1);

    const skipVal = limit * (page - 1);

    const users = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          posts: { $size: "$posts" },
        },
      },
      {
        $skip: skipVal,
      },
      {
        $limit: limit,
      },
    ]);

    let pagingCounter = (page - 1) * limit + 1;
    let nextPage;
    let hasPrevPage = false;
    let prevPage = null;
    if (page < 4) {
      nextPage = page + 1;
      hasNextPage = true;
    } else {
      nextPage = null;
      hasNextPage = false;
    }

    if (page > 1) {
      hasPrevPage = true;
      prevPage = page - 1;
    } else {
      hasPrevPage = false;
    }
    let totalPages = 10;
    let modular = limit % 10;

    if (modular) {
      totalPages = modular + 1;
    } else {
      let ans = limit / 10;
      totalPages = Math.ceil(10 / ans);
    }

    res.status(200).json({
      data: {
        users,
        pagination: {
          totalDocs,
          limit,
          page,
          totalPages,
          pagingCounter,
          hasPrevPage,
          hasNextPage,
          prevPage,
          nextPage,
        },
      },
    });
  } catch (error) {
    res.send({ error: error.message });
  }
};
