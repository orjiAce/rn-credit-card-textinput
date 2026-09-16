import React from 'react';
import TestRenderer, { act, ReactTestInstance } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

import CardDateTextInput from '../src/CardDateInput';

describe('CardDateTextInput characterization', () => {
  it('renders the existing label, placeholder, and native defaults', () => {
    const tree = TestRenderer.create(
      <CardDateTextInput
        label="expiry"
        placeholder="MM/YY"
        defaultValue="12/30"
        updateCardDateText={() => undefined}
      />,
    );

    expect(findHost(tree.root, 'Text').children).toContain('expiry');
    expect(findHost(tree.root, 'TextInput').props).toMatchObject({
      placeholder: 'MM/YY',
      maxLength: 5,
      keyboardType: 'number-pad',
      returnKeyType: 'done',
      clearButtonMode: 'while-editing',
      defaultValue: '12/30',
    });
  });

  it.each([
    ['2', '02/'],
    ['12', '12/'],
    ['0225', '02/25'],
    ['99', '99'],
  ])(
    'passes the current formatted value for %j to the callback',
    (input, expected) => {
      const updateCardDateText = vi.fn();
      const tree = TestRenderer.create(
        <CardDateTextInput updateCardDateText={updateCardDateText} />,
      );

      act(() => findHost(tree.root, 'TextInput').props.onChangeText(input));
      expect(updateCardDateText).toHaveBeenCalledWith(expected);
    },
  );

  it('always renders a supplied external error', () => {
    const tree = TestRenderer.create(
      <CardDateTextInput
        error="invalid date"
        touched={false}
        updateCardDateText={() => undefined}
      />,
    );

    expect(
      tree.root
        .findAll((node) => String(node.type) === 'Text')
        .some((node) => node.children.includes('invalid date')),
    ).toBe(true);
  });

  it('matches published 1.1.6 by applying focusColor when focused and touched', () => {
    const tree = TestRenderer.create(
      <CardDateTextInput
        focus
        touched
        focusColor="purple"
        defaultBorderColor="gray"
        updateCardDateText={() => undefined}
      />,
    );

    const borderedView = tree.root
      .findAll((node) => String(node.type) === 'View')
      .find((node) => node.props.style?.[0]?.borderColor === 'purple');
    expect(borderedView).toBeDefined();
  });

  it('documents that value is currently swallowed instead of reaching TextInput', () => {
    const tree = TestRenderer.create(
      <CardDateTextInput value="12/30" updateCardDateText={() => undefined} />,
    );

    expect(findHost(tree.root, 'TextInput').props.value).toBeUndefined();
  });

  it('keeps custom container, wrapper, label, and input style hooks', () => {
    const tree = TestRenderer.create(
      <CardDateTextInput
        cardInputContainerStyle={{ opacity: 0.9 }}
        inputWrapStyle={{ borderRadius: 4 }}
        labelStyle={{ fontWeight: 'bold' }}
        inputStyle={{ color: 'navy' }}
        updateCardDateText={() => undefined}
      />,
    );
    const rendered = tree.toJSON();
    expect(JSON.stringify(rendered)).toContain('opacity');
    expect(JSON.stringify(rendered)).toContain('borderRadius');
    expect(JSON.stringify(rendered)).toContain('fontWeight');
    expect(JSON.stringify(rendered)).toContain('navy');
  });
});

function findHost(root: ReactTestInstance, type: string): ReactTestInstance {
  return root.find((node) => node.type === type);
}
