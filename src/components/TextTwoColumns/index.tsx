// Style
import style from './index.module.css'

// Utils
import cn from 'classnames'

// Hooks
import useTransitionStage from 'hooks/useTransitionStage'
import { useInView } from 'react-intersection-observer'

// Components
import Container, { Row } from 'components/Container'

type NumberType = {
  value: string | number
  label: string
}

type Props = {
  title: string
  text: string
  numbers?: NumberType[]
  technologies?: string[]
}

const techDisplayNames: { [key: string]: string } = {
  '100aisong': '100% AI Song',
  'debuted': 'Debuted EP',
  'thousand': '1000+ Streams',
  'postcst': 'PostCSS',
  'lambda': 'Lambda',
  'flow': 'Flow',
  'glsl': 'GLSL',
  'pixi': 'Pixi',
  'sass': 'Sass',
  'react': 'React',
  'rx': 'RX',
  'three': 'Three.js',
  'vite': 'Vite',
  'webpack': 'Webpack'
}

const techs: { [key: string]: string } = {
  'flow': '/images/flow.jpg',
  'glsl': '/images/glsl.jpg',
  'lambda': '/images/lambda.jpg',
  'thousand': '/images/Icon_1000_Streams.png',
  'pixi': '/images/pixi.jpg',
  'postcst': '/images/postcss.jpg',
  'sass': '/images/sass.jpg',
  'react': '/images/react.jpg',
  'debuted': '/images/Icon_Debuted_Ep.png',
  'rx': '/images/rx.jpg',
  'three': '/images/three.jpg',
  'vite': '/images/vite.jpg',
  'webpack': '/images/webpack.jpg',
  '100aisong': '/images/Icon_100_ai_Song.png'
}

const TextTwoColumns = ({ title, text, numbers, technologies }: Props) => {
  const ts = useTransitionStage()
  const { ref, inView } = useInView({ triggerOnce: true })

  const classes = cn(style.root, ts && style[ts], {
    [style.visible]: inView
  })

  return (
    <div className={classes}>
      <Container grid withoutMenu>
        <Row start={1} end={1}>
          <div className={style.wrapper}>
            <h3 className={style.title} ref={ref}>
              {title}
            </h3>
          </div>
        </Row>
        <Row start={2} end={2}>
          <>
            <div className={style.text} dangerouslySetInnerHTML={{ __html: text }} />
            {numbers && (
              <div className={style.numbersContainer}>
                {numbers.map(({ value, label }, index) => (
                  <div key={index} className={style.item}>
                    <div className={style.wrapper}>
                      <span className={style.number}>{value}</span>
                    </div>
                    <div className={style.wrapper}>
                      <p className={style.label}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {technologies && (
              <div className={style.techContainer}>
                {technologies.map((technology, index) => {
                  const techKey = technology.toLowerCase().replace(/\s+/g, '')
                  return (
                    <div key={index} className={style.tech}>
                      <figure className={style.figure}>
                        <img
                          src={techs[techKey]}
                          alt={techDisplayNames[techKey]}
                          title={techDisplayNames[techKey]}
                        />
                        <figcaption>
                          <p className={style.label}>{techDisplayNames[techKey]}</p>
                        </figcaption>
                      </figure>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        </Row>
      </Container>
    </div>
  )
}

export default TextTwoColumns
