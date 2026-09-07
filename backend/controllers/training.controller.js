const User = require('../schemas/User');

module.exports.recordQuizPoints = async (req, res) => {
    try {
        const userId = req.body.userId || req.user?._id;
        const points = Number(req.body.points) || 0;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.greencoins = (user.greencoins || 0) + points;
        user.points = (user.points || 0) + points;
        await user.save();

        res.status(200).json({
            message: "Quiz points recorded successfully",
            quizPoints: user.greencoins,
            points: user.points,
        });
    } catch (error) {
        console.error("Error recording quiz points:", error);
        res.status(500).json({ message: "Internal server error" });
    }  
}