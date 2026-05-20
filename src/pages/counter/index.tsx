import './counter.css'
import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import styled from 'styled-components'
import { Counter, FormatCount } from '../../data/counts'
import background from '../../images/sealionlogo.png';

const CounterDiv = styled('div')`
  height: 75vh;
  width: 70vw;
  border-radius: 17vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const CounterNumber = styled('div')`
  color: white;
  font-size: 50vh;
  width: 100%;
  text-align: center;
`

const CounterLabel = styled('div')`
  color: white;
  font-size: 5.5vw;
  width: 100%;
  text-align: center;
`

const IndexPage: React.FC<PageProps> = () => {
  const [controllerCounter, setControllerCounter] = React.useState<Counter | null>(null);
  const [counts, setCounts] = React.useState({
    bullpen: 0,
    raceNumber: 0
  })
  React.useEffect(() => {
    if (controllerCounter) {
      setCounts(controllerCounter.getAllCounts());
      const counterListener = () => {
        setCounts(controllerCounter.getAllCounts());
      }
      controllerCounter.listenForCountChanges(counterListener);
      return () => {
        controllerCounter.removeListener(counterListener);
        controllerCounter.dispose();
      }
    } else {
      const newControllerCounter = new Counter();
      setControllerCounter(newControllerCounter);
      return () => {
        newControllerCounter.dispose();
      }
    }
  }, [controllerCounter]);
  return (
    <>
      <div style={{
        width: '100%',
        height: '100vh',
        backgroundImage: `url(${background})`,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'space-around'
      }}>
        <CounterDiv id="left-counter" className='counter' style={{
          backgroundColor: 'var(--counter-one)'
        }}>
          <CounterNumber>{FormatCount(counts.bullpen)}</CounterNumber>
          <CounterLabel><b>Bullpen up to</b></CounterLabel>
        </CounterDiv>
        <CounterDiv id="left-counter" className='counter' style={{
          backgroundColor: 'var(--counter-two)'
        }}>
          <CounterNumber>{FormatCount(counts.raceNumber)}</CounterNumber>
          <CounterLabel><b>Event</b></CounterLabel>
        </CounterDiv>

      </div>
    </>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Sea Lions Swim</title>
