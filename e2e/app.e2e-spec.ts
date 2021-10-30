import { workflow-angularPage } from './app.po';
import { createWriteStream } from 'fs';
// abstract writing screen shot to a file
function writeScreenShot(data, filename) {
  const stream = createWriteStream(filename);
  stream.write(Buffer.from(data, 'base64'));
  stream.end();
}

describe('workflow-angular App', () => {
  let page: workflow-angularPage;

  beforeEach(() => {
    page = new workflow-angularPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    page.fillInfo().then(result => writeScreenShot(result, 'sc001.jpg'));
    expect(page.getParagraphText()).toContain('企业协作平台');
  });
});
