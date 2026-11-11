import { render } from '@testing-library/react';
import { Plate } from '@/components/Plate';
import { UiShot } from '@/components/ui/UiShot';

describe('<Plate/>', () => {
  it('draws 120 knurl ticks, every 5th long, and fits the label to the ring', () => {
    const { container } = render(<Plate id="t1" />);
    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(120);
    expect(lines[0]?.getAttribute('y2')).toBe('80');
    expect(lines[1]?.getAttribute('y2')).toBe('62');
    const tp = container.querySelector('textPath');
    expect(tp?.getAttribute('href')).toBe('#t1');
    expect(tp?.getAttribute('textLength')).toBe('2330');
    expect(container.querySelector('#t1')).not.toBeNull();
    expect(container.querySelectorAll('circle')).toHaveLength(7);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('wheel variant: rim ticks, two rings, numerals, no ring text', () => {
    const nums = [[0, '01'], [18, '02']] as const;
    const { container } = render(<Plate variant="wheel" nums={nums} />);
    expect(container.querySelectorAll('line')).toHaveLength(120);
    expect(container.querySelector('line')?.getAttribute('y1')).toBe('14');
    expect(container.querySelector('textPath')).toBeNull();
    const t = container.querySelectorAll('text');
    expect(t).toHaveLength(2);
    expect(t[1]?.getAttribute('transform')).toBe('rotate(18 500 500)');
    expect(t[1]?.getAttribute('y')).toBe('108');
  });
});

describe('<UiShot/> IP gate', () => {
  it('renders the real screenshot only when allowed', () => {
    const { container } = render(<UiShot screen="dashboard" alt="Dashboard" real />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/img/dashboard.webp');
  });

  it('renders an illustrated placeholder (no image request) otherwise', () => {
    const { container, getByRole } = render(<UiShot screen="payments" alt="Payments" real={false} />);
    expect(container.querySelector('img')).toBeNull();
    expect(getByRole('img').getAttribute('aria-label')).toMatch(/Illustration of the Ironcrest Payments screen/);
  });
});
