import { render } from '@testing-library/react';

import MobileUi from './mobile-ui';

describe('MobileUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MobileUi />);
    expect(baseElement).toBeTruthy();
  });
});
