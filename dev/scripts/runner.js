/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('node:child_process')
const path = require('node:path')
const { Observable, defer, of, concat } = require('rxjs')
const { tap, switchMap } = require('rxjs/operators')

const rootDir = path.join(__dirname, '..', '..')
const pkg = require(path.join(rootDir, 'package.json'))
const PROJECT_NAME = pkg.name

if (!PROJECT_NAME) {
  console.error('❌ 无法从 package.json 读取 name 字段')
  process.exit(1)
}

const CONFIG = {
  infraFile: path.join(rootDir, 'dev', 'compose.infra.yml'),
  devFile: path.join(rootDir, 'dev', 'compose.dev.yml'),
  infraStack: `${PROJECT_NAME}-infra`,
  devStack: `${PROJECT_NAME}-dev`,
  env: { ...process.env, PROJECT_NAME },
  cwd: rootDir
}

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
}

const log = (level, msg) => {
  const color = level === 'INFO' ? colors.green : level === 'ERROR' ? colors.red : colors.blue
  const now = new Date()
  const time = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  console.log(`${time} ${color}[${level}]${colors.reset} ${msg}`)
}

const runCmd = (cmd, args, opts = {}) =>
  new Observable((subscriber) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: false, cwd: CONFIG.cwd, env: CONFIG.env, ...opts })

    const killHandler = () => child.kill('SIGINT')
    process.on('SIGINT', killHandler)
    process.on('SIGTERM', killHandler)

    child.on('close', (code) => {
      process.off('SIGINT', killHandler)
      process.off('SIGTERM', killHandler)
      if (code === 0) {
        subscriber.next()
        subscriber.complete()
      } else {
        subscriber.error(new Error(`Command "${cmd} ${args.join(' ')}" failed with code ${code}`))
      }
    })
  })

const checkInfraStatus$ = defer(
  () =>
    new Observable((subscriber) => {
      const child = spawn(
        'docker',
        ['compose', '-p', CONFIG.infraStack, '-f', CONFIG.infraFile, 'ps', '-q', 'postgres'],
        { stdio: ['ignore', 'pipe', 'inherit'], shell: false, cwd: CONFIG.cwd, env: CONFIG.env }
      )
      let output = ''
      child.stdout.on('data', (d) => {
        output += d.toString()
      })
      child.on('close', () => {
        subscriber.next(Boolean(output.trim()))
        subscriber.complete()
      })
    })
)

const ensureInfra$ = checkInfraStatus$.pipe(
  switchMap((isRunning) => {
    if (isRunning) {
      log('INFO', 'Infra 已运行，跳过启动')
      return of(null)
    }
    log('INFO', `启动基础设施栈 [${CONFIG.infraStack}] ...`)
    return runCmd('docker', ['compose', '-p', CONFIG.infraStack, '-f', CONFIG.infraFile, 'up', '-d', '--wait']).pipe(
      tap(() => log('INFO', 'Infra 已就绪'))
    )
  })
)

const startDevApp$ = defer(() => {
  log('INFO', '启动开发应用栈 (watch) ...')
  return runCmd('docker', [
    'compose',
    '-p',
    CONFIG.devStack,
    '-f',
    CONFIG.devFile,
    'up',
    '--force-recreate',
    '--watch',
    '--attach',
    'api',
    '--attach',
    'web'
  ])
})

const nuke$ = defer(() => {
  log('WARNING', '彻底清理 dev/infra 容器与卷...')
  const downDev = runCmd('docker', ['compose', '-p', CONFIG.devStack, '-f', CONFIG.devFile, 'down', '-v'])
  const downInfra = runCmd('docker', ['compose', '-p', CONFIG.infraStack, '-f', CONFIG.infraFile, 'down', '-v'])
  return concat(downDev, downInfra)
})

const clear$ = defer(() => {
  log('INFO', '停止容器但保留数据卷...')
  const downDev = runCmd('docker', ['compose', '-p', CONFIG.devStack, '-f', CONFIG.devFile, 'down'])
  const downInfra = runCmd('docker', ['compose', '-p', CONFIG.infraStack, '-f', CONFIG.infraFile, 'down'])
  return concat(downDev, downInfra)
})

const mode = process.argv[2]
let pipeline$

switch (mode) {
  case 'dev':
    pipeline$ = concat(ensureInfra$, startDevApp$)
    break
  case 'local':
    pipeline$ = ensureInfra$.pipe(tap(() => log('INFO', '基础设施就绪，可本机运行 pnpm dev'))) // 本地进程自行启动
    break
  case 'clear':
    pipeline$ = clear$
    break
  case 'nuke':
    pipeline$ = nuke$
    break
  default:
    log('ERROR', `未知模式: ${mode}`)
    process.exit(1)
}

pipeline$.subscribe({
  error: (err) => {
    log('ERROR', err.message)
    process.exit(1)
  },
  complete: () => {
    if (mode !== 'dev') log('INFO', '完成')
  }
})
