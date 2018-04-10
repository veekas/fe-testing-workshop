'use strict'

const { describe, it, before, after } = require('mocha')
const { expect } = require('chai')
const express = require('express')
const path = require('path')
const webdriver = require('selenium-webdriver')
const { Eyes } = require('eyes.selenium')
const { By, until } = webdriver
require('chromedriver')

describe('calculator app', function () {
  let driver
  let server

  before((done) => {
    const app = express()
    app.use('/', express.static(path.resolve(__dirname, '../../dist')))
    server = app.listen(8080, done)
  })

  after(() => {
    server.close()
  })

  before(async () => {
    driver = new webdriver.Builder()
      .forBrowser('chrome')
      .build()
  })

  after(async () => await driver.quit())

  it('should do calculations correctly', async () => {
    await driver.get('http://localhost:8080/')
    expect(await driver.getTitle()).to.equal('Calculator')

    const digit4Element = await driver.findElement(By.css('.digit-4'))
    const digit2Element = await driver.findElement(By.css('.digit-2'))
    const operatorMultiply = await driver.findElement(By.css('.operator-multiply'))
    const operatorEquals = await driver.findElement(By.css('.operator-equals'))

    await digit4Element.click()
    await digit2Element.click()
    await operatorMultiply.click()
    await digit2Element.click()
    await operatorEquals.click()

    await driver.wait(until.elementTextIs(await driver.findElement(By.css('.display')), '84'))
  })

  if (!process.env.APPLITOOLS_API_KEY) {
    console.warn('******** Skipping visual tests ************\n' +
      'To run them, set the APPLITOOLS_API_KEY environment variable with your Applitools API Key.')
    return
  }

  describe.only('visual testing', () => {
    let eyes
    before(async () => {
      eyes = new Eyes()

      eyes.setApiKey(process.env.APPLITOOLS_API_KEY)

      await eyes.open(driver, 'Calculator App', 'Tests', { width: 800, height: 600 })
    })

    after(async () => {
      await eyes.close()
    })

    it('should look good', async function () {
      await driver.get('http://localhost:8080')

      await eyes.checkWindow('Initial Page')

      const digit4Element = await driver.findElement(By.css('.digit-4'))
      const digit2Element = await driver.findElement(By.css('.digit-2'))
      const operatorMultiply = await driver.findElement(By.css('.operator-multiply'))
      const operatorEquals = await driver.findElement(By.css('.operator-equals'))

      await digit4Element.click()
      await digit2Element.click()
      await operatorMultiply.click()
      await digit2Element.click()
      await operatorEquals.click()

      await eyes.checkWindow('After calculating 42 * 2 =')
    })
  })
})
