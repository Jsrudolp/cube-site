import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  FACE_INDEX_TO_ID,
  FACE_ID_TO_INDEX,
  FACE_CENTERS,
  FACE_NORMALS,
  CANONICAL_QUATERNIONS,
  SQUARED_CAMERA_POSITIONS,
  CAMERA_UP_VECTORS,
  CAMERA_POSITION,
} from "@/lib/cube-config";
import { FACES } from "@/lib/faces";

const ALL_FACE_IDS = ["community", "music", "thinking", "building", "front", "back"] as const;

describe("FACE_INDEX_TO_ID", () => {
  it("has exactly 6 entries", () => {
    expect(FACE_INDEX_TO_ID).toHaveLength(6);
  });

  it("contains all face IDs exactly once", () => {
    expect([...FACE_INDEX_TO_ID].sort()).toEqual([...ALL_FACE_IDS].sort());
  });

  it("maps index 4 to front (+Z) and index 5 to back (-Z)", () => {
    expect(FACE_INDEX_TO_ID[4]).toBe("front");
    expect(FACE_INDEX_TO_ID[5]).toBe("back");
  });

  it("maps index 0 to community (+X) and index 1 to music (-X)", () => {
    expect(FACE_INDEX_TO_ID[0]).toBe("community");
    expect(FACE_INDEX_TO_ID[1]).toBe("music");
  });

  it("maps index 2 to thinking (+Y) and index 3 to building (-Y)", () => {
    expect(FACE_INDEX_TO_ID[2]).toBe("thinking");
    expect(FACE_INDEX_TO_ID[3]).toBe("building");
  });
});

describe("FACE_ID_TO_INDEX", () => {
  it("is the exact inverse of FACE_INDEX_TO_ID", () => {
    FACE_INDEX_TO_ID.forEach((faceId, index) => {
      expect(FACE_ID_TO_INDEX[faceId]).toBe(index);
    });
  });

  it("round-trips through both mappings", () => {
    ALL_FACE_IDS.forEach((id) => {
      const idx = FACE_ID_TO_INDEX[id];
      expect(FACE_INDEX_TO_ID[idx]).toBe(id);
    });
  });
});

describe("FACE_NORMALS", () => {
  it("all normals have unit length", () => {
    ALL_FACE_IDS.forEach((id) => {
      expect(FACE_NORMALS[id].length()).toBeCloseTo(1, 10);
    });
  });

  it("opposite faces have opposite normals", () => {
    expect(FACE_NORMALS["front"].dot(FACE_NORMALS["back"])).toBeCloseTo(-1, 10);
    expect(FACE_NORMALS["community"].dot(FACE_NORMALS["music"])).toBeCloseTo(-1, 10);
    expect(FACE_NORMALS["thinking"].dot(FACE_NORMALS["building"])).toBeCloseTo(-1, 10);
  });

  it("no two normals point in the same direction (dot product ≠ 1)", () => {
    // We only check dot ≠ 1 (identical direction), not dot ≠ -1 (opposite is fine —
    // that's exactly what front/back and the other paired faces have).
    for (let i = 0; i < ALL_FACE_IDS.length; i++) {
      for (let j = i + 1; j < ALL_FACE_IDS.length; j++) {
        const dot = FACE_NORMALS[ALL_FACE_IDS[i]].dot(FACE_NORMALS[ALL_FACE_IDS[j]]);
        expect(dot).not.toBeCloseTo(1, 5);
      }
    }
  });

  it("front normal points in +Z", () => {
    expect(FACE_NORMALS["front"].z).toBeCloseTo(1, 10);
  });

  it("back normal points in -Z", () => {
    expect(FACE_NORMALS["back"].z).toBeCloseTo(-1, 10);
  });
});

describe("FACE_CENTERS", () => {
  it("each center is 1 unit from origin", () => {
    ALL_FACE_IDS.forEach((id) => {
      expect(FACE_CENTERS[id].length()).toBeCloseTo(1, 10);
    });
  });

  it("each center aligns with its normal", () => {
    ALL_FACE_IDS.forEach((id) => {
      const center = FACE_CENTERS[id];
      const normal = FACE_NORMALS[id];
      expect(center.dot(normal)).toBeCloseTo(1, 10);
    });
  });

  it("front center is at (0, 0, 1)", () => {
    expect(FACE_CENTERS["front"].toArray()).toEqual([0, 0, 1]);
  });
});

describe("CANONICAL_QUATERNIONS", () => {
  it("all quaternions are unit quaternions", () => {
    ALL_FACE_IDS.forEach((id) => {
      const q = CANONICAL_QUATERNIONS[id];
      const length = Math.sqrt(q.x ** 2 + q.y ** 2 + q.z ** 2 + q.w ** 2);
      expect(length).toBeCloseTo(1, 10);
    });
  });

  it("front face quaternion is identity (no rotation needed)", () => {
    const q = CANONICAL_QUATERNIONS["front"];
    expect(q.x).toBeCloseTo(0, 10);
    expect(q.y).toBeCloseTo(0, 10);
    expect(q.z).toBeCloseTo(0, 10);
    expect(q.w).toBeCloseTo(1, 10);
  });

  it("rotating +Z by each quaternion points each face toward camera (+Z world)", () => {
    // When a face's canonical quaternion is applied, that face's normal should
    // point along +Z in world space (toward the camera at [0,0,+dist])
    ALL_FACE_IDS.forEach((id) => {
      const q = CANONICAL_QUATERNIONS[id];
      const faceNormalLocal = FACE_NORMALS[id].clone();

      // Apply the inverse quaternion to transform the face normal from local to world
      // (rotating the cube by q should bring that face's normal to point in +Z)
      // Equivalently: q * faceNormal * q^-1 should equal +Z
      const worldNormal = faceNormalLocal.clone().applyQuaternion(q);
      expect(worldNormal.z).toBeCloseTo(1, 5);
    });
  });
});

describe("SQUARED_CAMERA_POSITIONS", () => {
  // CAMERA_DISTANCE is the magnitude of CAMERA_POSITION
  const [cx, cy, cz] = CAMERA_POSITION;
  const expectedDistance = Math.sqrt(cx ** 2 + cy ** 2 + cz ** 2);

  it("all squared camera positions are at the same distance from origin", () => {
    ALL_FACE_IDS.forEach((id) => {
      const pos = SQUARED_CAMERA_POSITIONS[id];
      expect(pos.length()).toBeCloseTo(expectedDistance, 5);
    });
  });

  it("each squared position aligns with its face normal (camera faces the face)", () => {
    ALL_FACE_IDS.forEach((id) => {
      const pos = SQUARED_CAMERA_POSITIONS[id].clone().normalize();
      const normal = FACE_NORMALS[id];
      // Camera should be along the face normal direction
      expect(pos.dot(normal)).toBeCloseTo(1, 5);
    });
  });

  it("front camera is at positive Z", () => {
    expect(SQUARED_CAMERA_POSITIONS["front"].z).toBeGreaterThan(0);
    expect(SQUARED_CAMERA_POSITIONS["front"].x).toBeCloseTo(0, 10);
    expect(SQUARED_CAMERA_POSITIONS["front"].y).toBeCloseTo(0, 10);
  });
});

describe("CAMERA_UP_VECTORS", () => {
  it("all up vectors have unit length", () => {
    ALL_FACE_IDS.forEach((id) => {
      expect(CAMERA_UP_VECTORS[id].length()).toBeCloseTo(1, 10);
    });
  });

  it("up vectors for top/bottom faces avoid gimbal lock", () => {
    // When looking at the top face (camera along +Y), up cannot be +Y
    const thinkingUp = CAMERA_UP_VECTORS["thinking"];
    expect(Math.abs(thinkingUp.y)).toBeLessThan(0.1);

    // When looking at the bottom face (camera along -Y), up cannot be +Y
    const buildingUp = CAMERA_UP_VECTORS["building"];
    expect(Math.abs(buildingUp.y)).toBeLessThan(0.1);
  });

  it("side/front/back faces use standard +Y up", () => {
    ["front", "back", "community", "music"].forEach((id) => {
      const faceId = id as typeof ALL_FACE_IDS[number];
      expect(CAMERA_UP_VECTORS[faceId].y).toBeCloseTo(1, 10);
    });
  });
});

describe("FACES lib consistency", () => {
  it("every face in FACES has a matching entry in FACE_INDEX_TO_ID", () => {
    FACES.forEach((face) => {
      expect(FACE_INDEX_TO_ID).toContain(face.id);
    });
  });

  it("every face in FACE_INDEX_TO_ID has a matching route in FACES", () => {
    FACE_INDEX_TO_ID.forEach((faceId) => {
      const face = FACES.find((f) => f.id === faceId);
      expect(face).toBeDefined();
      expect(face?.route).toBeTruthy();
    });
  });
});
