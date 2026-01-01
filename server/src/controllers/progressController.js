import ProgressService from '../services/progressService.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getDailyProgress = catchAsync(async (req, res, next) => {
    const progress = await ProgressService.getOrCreateDailyProgress(req.user.id);

    res.status(200).json({
        status: 'success',
        data: {
            progress
        }
    });
});

export const updateVideoProgress = catchAsync(async (req, res, next) => {
    const { topicId, duration } = req.body;
    const progress = await ProgressService.recordVideoWatched(req.user.id, topicId, duration);

    res.status(200).json({
        status: 'success',
        data: {
            progress
        }
    });
});

export const completeTopic = catchAsync(async (req, res, next) => {
    const { topicId } = req.body;
    const { progress, leveledUp } = await ProgressService.recordTopicCompleted(req.user.id, topicId);

    res.status(200).json({
        status: 'success',
        data: {
            progress,
            leveledUp
        }
    });
});
