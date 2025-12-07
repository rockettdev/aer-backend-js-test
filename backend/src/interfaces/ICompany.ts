import { IEmployee } from "./IEmployee"

export interface ICompany {
  id: number
  name: string
  industry: string
  active: boolean
  website: string
  telephone: string
  slogan: string
  address: string
  city: string
  country: string
  employees?: IEmployee[]
}