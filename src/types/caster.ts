/**
 * One row in the list: a vMix Call key plus the name that caster shows up as.
 *
 * `id` exists only so React can tell rows apart when you add, edit or delete them. It is never
 * part of the generated link. Without it, deleting the middle row would make React reuse the
 * wrong input boxes.
 */
export type Caster = {
  id: string;
  code: string;
  name: string;
};
