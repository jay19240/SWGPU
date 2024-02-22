import { TreePartition, TreePartitionNode, ITreePartitionMethod, SplitResult } from '../core/tree_partition';
import { Gfx2BoundingRect } from './gfx2_bounding_rect';

/**
 * A 2D binary tree space partition.
 */
class Gfx2TreePartition extends TreePartition<Gfx2BoundingRect> {
  /**
   * @param {number} maxChildren - The maximum number of children that a node in the tree can have. It determines the branching factor of the tree, i.e.
   * @param {number} maxDepth - The maximum depth or level of the tree partition. It determines how deep the tree can be divided into smaller partitions.
   * @param {Gfx2BoundingRect} rect - The top bounding rectangle of the tree partition space.
   */
  constructor(maxChildren: number, maxDepth: number, rect: Gfx2BoundingRect = new Gfx2BoundingRect([0, 0], [0, 0])) {
    super(maxChildren, maxDepth, new Gfx2TreePartitionMethod(rect, 'x'));
  }
}

/**
 * A 2D binary tree space partition method for quick search intersections.
 */
class Gfx2TreePartitionMethod implements ITreePartitionMethod<Gfx2BoundingRect> {
  rect: Gfx2BoundingRect;
  axis: 'x' | 'y';

  /**
   * @param {Gfx2BoundingRect} rect - The partition rectangle.
   * @param {'x' | 'y'} axis - The partition split axis.
   */
  constructor(rect: Gfx2BoundingRect, axis: 'x' | 'y') {
    this.rect = rect;
    this.axis = axis;
  }

 /**
  * Search and return all objects that intersect with the target.
  * 
  * @param {Gfx2BoundingRect} target - The target object.
  * @param {Array<Gfx2BoundingRect>} results - All matching objects.
  */
  search(node: TreePartitionNode<Gfx2BoundingRect>, target: Gfx2BoundingRect, results: Array<Gfx2BoundingRect> = []): Array<Gfx2BoundingRect> {
    const method = node.getMethod() as Gfx2TreePartitionMethod;
    const nodeBox = method.rect;
    if (!nodeBox.intersectBoundingRect(target)) {
      return [];
    }

    const left = node.getLeft();
    const right = node.getRight();

    if (left && right) {
      left.search(target, results);
      right.search(target, results);
    }
    else {
      const children = node.getChildren();
      const max = children.length;
      for (let i = 0; i < max; i++) {
        if (children[i].intersectBoundingRect(target)) {
          results.push(children[i]);
        }
      }
    }

    return results;
  }

  /**
   * Splits objects into left and right based on a specified axis, finally it returns new partition methods for each side.
   * 
   * @param {Array<Gfx2BoundingRect>} objects - A list of bounding rectangle.
   */
  split(objects: Array<Gfx2BoundingRect>): SplitResult<Gfx2BoundingRect> {
    const left = [];
    const right = [];
    const center = this.rect.getCenter();

    for (const object of objects) {
      if (this.axis === 'x') {
        if (object.min[0] >= center[0]) {
          right.push(object);
        }
        else {
          left.push(object);
        }
      }
      else {
        if (object.min[1] >= center[1]) {
          right.push(object);
        }
        else {
          left.push(object);
        }
      }
    }

    const rects = (this.axis === 'x') ? SPLIT_VERTICAL(this.rect) : SPLIT_HORIZONTAL(this.rect);
    const newAxis = (this.axis === 'x') ? 'y' : 'x';
    const leftMethod = new Gfx2TreePartitionMethod(rects[0], newAxis);
    const rightMethod = new Gfx2TreePartitionMethod(rects[1], newAxis);

    return { left, right, leftMethod, rightMethod };
  }
}

export { Gfx2TreePartition };

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function SPLIT_VERTICAL(aabb: Gfx2BoundingRect): Array<Gfx2BoundingRect> {
  const size = aabb.getSize();
  const center = aabb.getCenter();

  return [
    Gfx2BoundingRect.createFromCoord(aabb.min[0], aabb.min[1], size[0] * 0.5, size[1]),
    Gfx2BoundingRect.createFromCoord(center[0], aabb.min[1], size[0] * 0.5, size[1])
  ];
}

function SPLIT_HORIZONTAL(aabb: Gfx2BoundingRect): Array <Gfx2BoundingRect> {
  const size = aabb.getSize();
  const center = aabb.getCenter();

  return [
    Gfx2BoundingRect.createFromCoord(aabb.min[0], aabb.min[1], size[0], size[1] * 0.5),
    Gfx2BoundingRect.createFromCoord(aabb.min[0], center[1], size[0], size[1] * 0.5)
  ];
}