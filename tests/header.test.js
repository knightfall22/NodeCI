const Page = require('./helpers/page')

let page

beforeEach(async () => {

       page = await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    await page.close()
})

test('Header as the correct text', async () =>{
    
    const text = await page.getContentsOf('a.brand-logo')
    expect(text).toBe('Blogster')
    
})

test('Clicking login starts Oauth flow', async () =>{
    await page.click('.right a')

    const url = await page.url()

    expect(url).toMatch('/accounts\.google\.com/')
})

test('When signed in show logout button', async () =>{
    await page.login()

    const text = await page.getContentsOf('a[href="/auth/logout"]')
    expect(text).toBe('Logout')
})