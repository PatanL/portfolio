import { createModel } from '@rematch/core'
import type { RootModel } from '../models'

type Project = {
  name: string
  url: string
  videoID: string
}

const initialState: Project[] = [
  {
    name: 'Cipher',
    url: 'cipher',
    videoID: 'skReel'
  },
  {
    name: 'Aurora',
    url: 'aurora',
    videoID: 'aqReel'
  },
  {
    name: 'Coming Soon',
    url: 'comingsoon',
    videoID: 'fbReel'
  }
  // {
  //   name: 'Feudi',
  //   url: 'feudi',
  //   videoID: 'feudiReel'
  // },
  // {
  //   name: 'Claraluna',
  //   url: 'claraluna',
  //   videoID: 'claralunaReel'
  // }
]

export const projects = createModel<RootModel>()({
  state: initialState
})
