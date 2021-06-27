export class Script2 {
  async main (): Promise<void> {
    console.log('Hello from script 2 reloaded')
  }
}

new Script2().main().catch(e => {
  console.log(e)
})
