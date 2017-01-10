import { PiserverPage } from './app.po';

describe('piserver App', function() {
  let page: PiserverPage;

  beforeEach(() => {
    page = new PiserverPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
