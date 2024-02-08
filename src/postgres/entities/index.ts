import { Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity({ name: "scaffold" })
export class ScaffoldEntity {
  @PrimaryGeneratedColumn()
  id: number
}
