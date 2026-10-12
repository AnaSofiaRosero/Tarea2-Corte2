import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { RoutineExercise } from '../../routines/entities/routine-exercise.entity';

import { ActivityLog } from './activity-log.entity';

@Entity('activity_exercises')
export class ActivityExercise {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ActivityLog, (activityLog) => activityLog.activityExercises, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'activity_log_id' })
    activityLog: ActivityLog;

    @ManyToOne(() => RoutineExercise, (routineExercise) => routineExercise.activityExercises, { nullable: false })
    @JoinColumn({ name: 'routine_exercise_id' })
    routineExercise: RoutineExercise;

    @Column({ name: 'actual_sets', type: 'int', nullable: true })
    actualSets: number;

    @Column({ name: 'actual_reps', type: 'int', nullable: true })
    actualReps: number;

    @Column({ name: 'actual_weight_kg', type: 'float', nullable: true })
    actualWeightKg: number;

    @Column({ name: 'actual_duration_min', type: 'int', nullable: true })
    actualDurationMin: number;

    @Column({ name: 'calories_burned', type: 'float', nullable: true })
    caloriesBurned: number;

    @Column({ name: 'distance_covered_km', type: 'float', nullable: true })
    distanceCoveredKm: number;

    @Column({ name: 'started_at', type: 'timestamp', nullable: true })
    startedAt: Date;

    @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
    completedAt: Date;
}
