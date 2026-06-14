# Things to add

---

- Organization: filter, sort and group channels
- Select channels
- Create an action queue (rename, move to group, make private/public)

## Organization

- Grouping
    - index (title splitter parser) 
    - owner

- Sort
    - length
    - created
    - updated
    - connections

- Filter
    - search filter
    - owned by
    - count length
    - collaborators

## Selection
 |
 ↳ Interaction: Arrow keys and vim keys to move up and down. Space to select.

- select to select, select selected to unselect

## Selection To Action
- A window where all the actions get built
- Rename
    - Replace Text
        - occurences (all, first, last, regex)
    - Add Text
        - position (ending, begining, index)
    - Add Sequence
        - start, step, padding, position^, prefix, suffix
    - Change Case
        - upper, lower, title, sentence, camel, snake

- Make private/public
- Move to channel/copy paste
- Move to another owner (Waiting to be added to api)

## Action Queue
- draft out the actions you're going to perform
- be editable (?)
- then that means I need an action schema
