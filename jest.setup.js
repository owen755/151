import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'node:util'

// React Router needs these two, and the test browser (jsdom) does not have them
Object.assign(globalThis, { TextEncoder, TextDecoder })
