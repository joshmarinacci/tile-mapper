import { ArrayGrid, Bounds, Point, range } from "josh_js_util"
import { describe, expect, it } from "vitest"

import { copyContentsFrom } from "./move_tool"

describe("array grid test", () => {
  it("should create an array", async () => {
    const arr = new ArrayGrid<number>(20, 20)
    arr.fill((n) => 24)
    expect(arr.get_at(0, 0)).toBe(24)
    expect(arr.w).toBe(20)
    expect(arr.h).toBe(20)
  })

  it("can copy same size array grids", async () => {
    const arr1 = new ArrayGrid<number>(10, 10)
    arr1.fill((n) => 24)
    const arr2 = new ArrayGrid<number>(10, 10)
    arr2.fill((n) => 25)
    expect(arr1.w).toBe(10)
    expect(arr2.w).toBe(10)
    expect(arr1.get_at(0, 0)).toBe(24)
    expect(arr2.get_at(0, 0)).toBe(25)
    copyContentsFrom(arr1, new Bounds(0, 0, 10, 10), arr2, new Point(0, 0))
    expect(arr2.get_at(0, 0)).toBe(24)
    expect(arr2.get_at(9, 9)).toBe(24)
  })

  it("can copy sub array grids", async () => {
    const arr1 = new ArrayGrid<number>(10, 10)
    arr1.fill((n) => 24)
    const arr2 = new ArrayGrid<number>(10, 10)
    arr2.fill((n) => 25)
    expect(arr1.w).toBe(10)
    expect(arr2.w).toBe(10)
    expect(arr1.get_at(0, 0)).toBe(24)
    expect(arr2.get_at(0, 0)).toBe(25)
    copyContentsFrom(arr1, new Bounds(0, 0, 2, 2), arr2, new Point(0, 0))
    expect(arr2.get_at(0, 0)).toBe(24)
    expect(arr2.get_at(1, 1)).toBe(24)
    expect(arr2.get_at(2, 2)).toBe(25)
    expect(arr2.get_at(3, 3)).toBe(25)
    expect(arr2.get_at(4, 4)).toBe(25)
  })

  it("can copy sub array offset", async () => {
    const arr1 = new ArrayGrid<number>(10, 10)
    arr1.fill((n) => 24)
    const arr2 = new ArrayGrid<number>(10, 10)
    arr2.fill((n) => 25)
    expect(arr1.w).toBe(10)
    expect(arr2.w).toBe(10)
    copyContentsFrom(arr1, new Bounds(2, 2, 2, 2), arr2, new Point(0, 0))
    expect(arr2.get_at(0, 0)).toBe(24)
    expect(arr2.get_at(1, 1)).toBe(24)
    expect(arr2.get_at(2, 2)).toBe(25)
    expect(arr2.get_at(3, 3)).toBe(25)
    expect(arr2.get_at(4, 4)).toBe(25)
  })

  it("can copy sub array offset with offset", async () => {
    const arr1 = new ArrayGrid<number>(10, 10)
    arr1.fill((n) => 24)
    const arr2 = new ArrayGrid<number>(10, 10)
    arr2.fill((n) => 25)
    expect(arr1.w).toBe(10)
    expect(arr2.w).toBe(10)
    copyContentsFrom(arr1, new Bounds(2, 2, 2, 2), arr2, new Point(2, 2))
    expect(arr2.get_at(0, 0)).toBe(25)
    expect(arr2.get_at(1, 1)).toBe(25)
    expect(arr2.get_at(2, 2)).toBe(24)
    expect(arr2.get_at(3, 3)).toBe(24)
    expect(arr2.get_at(4, 4)).toBe(25)
    expect(arr2.get_at(5, 5)).toBe(25)
    expect(arr2.get_at(6, 6)).toBe(25)
    expect(arr2.get_at(7, 7)).toBe(25)
  })

  it("can copy 2x2 at 2x2 with different values", async () => {
    const arr1 = new ArrayGrid<number>(10, 10)
    arr1.fill((n) => 24)
    arr1.set_at(3, 3, 28)
    const arr2 = new ArrayGrid<number>(10, 10)
    arr2.fill((n) => 25)
    copyContentsFrom(arr1, new Bounds(2, 2, 2, 2), arr2, new Point(0, 0))
    expect(arr2.get_at(0, 0)).toBe(24)
    expect(arr2.get_at(1, 1)).toBe(28)
  })
})
