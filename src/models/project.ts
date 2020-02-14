import {Column, DataType, HasMany, Model, Table} from "sequelize-typescript";
import {Job} from "./job";

@Table({underscored: true})
export class Project extends Model<Project> {

    @Column(DataType.STRING)
    name: string;

    @Column(DataType.STRING)
    location: string;

    @HasMany(() => Job)
    jobs: Job[];
}