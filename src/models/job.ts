import {BelongsTo, Column, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {JobExecution} from "./job-execution";
import {Argument} from "./argument";
import {Project} from "./project";

@Table({underscored: true})
export class Job extends Model<Job> {

    @ForeignKey(() => Project)
    @Column
    projectId: number;

    @BelongsTo(() => Project, 'projectId')
    project: Project;

    @Column
    name: string;

    @Column
    branch: string;

    @Column
    scriptName: string;

    @Column
    active: boolean;

    @HasMany(() => Argument)
    arguments: Argument[];

    @HasMany(() => JobExecution)
    jobExecutions: JobExecution[];
}