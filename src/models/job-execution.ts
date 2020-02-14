import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import {Job} from "./job";

@Table({underscored: true})
export class JobExecution extends Model<JobExecution> {

    @ForeignKey(() => Job)
    @Column
    jobId: number;

    @BelongsTo(() => Job, 'jobId')
    job: Job;

    @Column
    executionTime: Date;

    @Column
    outputFile: string;

    @Column
    exitCode: number;
}