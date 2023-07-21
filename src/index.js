/*
911.glb
Author: Karol Miklas https://sketchfab.com/karolmiklas
Sketchfab: https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf */

import { render } from 'react-dom'
import { Suspense } from 'react'
import { Footer } from '@pmndrs/branding'
import './styles.css'
import { App } from './App'

render(
  <Suspense fallback={null}>
    <div className="fullscreen">
      <App />
      <Overlay />
    </div>
  </Suspense>,
  document.getElementById('root')
)

function Overlay() {
  return (
    <>
      <div style={{ color: '#808080', position: 'absolute', top: 40, left: 40, fontSize: '13px' }}>
        Motion One Scroll Down and 
      </div>
    </>
  )
}
