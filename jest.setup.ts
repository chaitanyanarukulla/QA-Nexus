import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, { TextEncoder, TextDecoder })

if (typeof global.TransformStream === 'undefined') {
    const { TransformStream } = require('stream/web')
    Object.assign(global, { TransformStream })
}
