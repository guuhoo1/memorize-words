package com.example.memorize.util;

/**
 * SM-2 间隔重复算法（SuperMemo 2）
 * grade：0=Again, 2=Hard, 4=Good, 5=Easy
 */
public class Sm2Algorithm {

    public static Result calculate(double currentEF, int currentRep, int grade) {
        double ef = currentEF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
        if (ef < 1.3) ef = 1.3;

        int repetitions;
        int interval;

        if (grade < 4) {
            repetitions = 0;
            interval = 0;
        } else {
            repetitions = currentRep + 1;
            if (currentRep == 0) {
                interval = 1;
            } else if (currentRep == 1) {
                interval = 6;
            } else {
                interval = (int) Math.round(currentRep * ef);
                if (grade == 5) interval = (int) Math.round(interval * 1.3);
            }
        }
        return new Result(ef, interval, repetitions);
    }

    public record Result(double easeFactor, int intervalDays, int repetitions) {}
}
