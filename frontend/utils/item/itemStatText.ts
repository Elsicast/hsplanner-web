import { translateIncarnationText } from '../tree/incarnationText'
import { statName } from './stats'

export function displayStatName(key: string): string {
  return translateIncarnationText(statName(key))
}
