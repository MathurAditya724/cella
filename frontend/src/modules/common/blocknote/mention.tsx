import { BlockNoteSchema, defaultInlineContentSpecs } from '@blocknote/core';
import { type DefaultReactGridSuggestionItem, createReactInlineContentSpec } from '@blocknote/react';
import { AvatarWrap } from '~/modules/common/avatar-wrap';
import type { Member } from '~/types/common';

// The Mention inline content.
export const Mention = createReactInlineContentSpec(
  {
    type: 'mention',
    propSchema: {
      name: {
        default: 'Unknown',
      },
      id: {
        default: 'Unknown',
      },
    },
    content: 'none',
  },
  {
    render: (props) => <span style={{ backgroundColor: '#E11D48', borderRadius: '2px', padding: '0px 2px' }}>@{props.inlineContent.props.name}</span>,
  },
);

export const schemaWithMentions = BlockNoteSchema.create({
  inlineContentSpecs: {
    // Adds all default inline content.
    ...defaultInlineContentSpecs,
    // Adds the mention tag.
    mention: Mention,
  },
});

// Function which gets all users for the mentions menu.
export const getMentionMenuItems = (members: Member[], editor: typeof schemaWithMentions.BlockNoteEditor): DefaultReactGridSuggestionItem[] => {
  return members.map((m) => ({
    id: m.id,
    onItemClick: () => {
      editor.insertInlineContent([
        {
          type: 'mention',
          props: {
            name: m.name,
            id: m.id,
          },
        },
        ' ', // add a space after the mention
      ]);
    },
    icon: <AvatarWrap type="user" id={m.id} name={m.name} url={m.thumbnailUrl} className="h-5 w-5 text-xs" />,
  }));
};
