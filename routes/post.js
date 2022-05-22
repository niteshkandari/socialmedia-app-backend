const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//create a post
router.post("/", async (req, res, next) => {
  const newPost = new Post(req.body);
  try {
    // const savedPost = await newPost.save();
    // res.status(200).json(savedPost);
    //other way
    newPost.save().then((result) => {
      res.status(200).json(result);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//update a post
router.put("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your own post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post
router.delete("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can only delete your own post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like or dislike a post
router.put("/:id/like", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.update({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//get a post
router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get timeline posts
router.get("/timeline/all", async (req, res, next) => {
  //here we had to add all in params cos above one is also get req so it would have conflicted thinking timeline is id
  try {
    const currenUser = await User.findById(req.body.userId);
    const userPost = await Post.find({ userId: currenUser._id });
    const friendPost = await Promise.all(
      currenUser.following.map((frndId) => {
        return Post.find({ userId: frndId });
      })
    );
    res.status(200).json(userPost.concat(...friendPost));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
