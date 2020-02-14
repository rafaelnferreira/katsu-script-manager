import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import {Job} from "./job";

@Table({underscored: true})
export class Argument extends Model<Argument> {

    @ForeignKey(() => Job)
    @Column
    jobId: number;

    @BelongsTo(() => Job, 'jobId')
    job: Job;

    @Column
    option: string;

    @Column
    value: string;
}