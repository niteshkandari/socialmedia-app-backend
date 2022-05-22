const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
router.put("/:id", async (req, res, next) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.gensalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json({ user, message: "Account has been updated" });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account");
  }
});
//delete user
router.delete("/:id", async (req, res, next) => {
  if (!req.body.userId) res.status(500).json("user id missing");
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.deleteOne({ _id: req.params.id }); //or findByIdAndDelete(req.params.id);
      res
        .status(200)
        .json({ user, message: "Account has been deleted succesfully" });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account");
  }
});
//get a user
router.get("/:id", (req, res, next) => {
  if (!req.params.id) res.status(500).json("id missing");
  User.findById(req.params.id)
    .exec()
    .then((result) => {
      if (result) {
        const { password, updatedAt, ...others } = result._doc;
        res.status(200).json(others);
      }
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});
//get all users
router.get("/", (req, res, next) => {
  User.find()
    .exec()
    .then((result) => {
      if (result) {
        const forbiddenData = [];
        result.forEach((user) => {
          const { password, updatedAt, ...others } = user._doc;
          forbiddenData.push(others);
        });
        res.status(200).json(forbiddenData);
      }
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});
//follow a user
router.put("/:id/follow", async (req, res, next) => {
  if (!req.params.id) res.status(500).json("id missing");
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({
          $push: { following: req.params.id },
        });
        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("you already follow those user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cannot follow yourself");
  }
});
//unfollow a user
router.put("/:id/unfollow", async (req, res, next) => {
  if (!req.params.id) res.status(500).json("id missing");
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({
          $pull: { following: req.params.id },
        });
        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cannot unfollow yourself");
  }
});
module.exports = router;
