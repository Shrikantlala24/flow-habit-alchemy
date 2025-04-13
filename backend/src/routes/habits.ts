import express from "express";
import Habit from "../models/Habit";

const router = express.Router();

router.get("/", async (req, res) => {
  const habits = await Habit.find();
  res.json(habits);
});

router.post("/", async (req, res) => {
  const newHabit = new Habit(req.body);
  await newHabit.save();
  res.status(201).json(newHabit);
});

router.delete("/:id", async (req, res) => {
  await Habit.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Habit deleted" });
});

export default router;