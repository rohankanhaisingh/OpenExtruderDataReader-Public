import { Vec2 } from "../functions/math";
import { UniqueID } from "../functions/uid";
import { PhysicsWorld2DConstructor, RigidBody2DConstructor } from "../typings";
import { RenderObject } from "./renderobject";

import { Body, World, Vec2 as P_Vec2, Circle, Box, Fixture, FixtureOpt } from "planck-js";
import { Rectangle } from "./rectangle";

export class PhysicsWorld2D implements PhysicsWorld2DConstructor {

	public id: string = UniqueID(18).id;
	public timestamp: number = Date.now();

	public gravity: number = 10;

	public rigidBodies: RigidBody2D[] = [];

	public world: World = new World();

	constructor() {}

	public Update(deltaTime: number): void {

		for (let i = 0; i < this.rigidBodies.length; i++) {

			const rigidBody: RigidBody2D = this.rigidBodies[i];

			rigidBody.Update();
		}

		this.world.step(1 / 60); 
	}

	public SetGravity(horizontalGravityForce: number, verticalGravityForce: number) {

		this.world.setGravity(new P_Vec2(horizontalGravityForce, verticalGravityForce));
	}
}

export class RigidBody2D implements RigidBody2DConstructor {

	public id: string = UniqueID(18).id;
	public timestamp: number = Date.now();

	declare public renderObject: RenderObject;
	declare public physicsWorld2D: PhysicsWorld2D;
	declare public body: Body;

	declare public shape: Box | Circle;
	declare public fixture: Fixture;

	constructor(physicsWorld2D: PhysicsWorld2D, renderObject: RenderObject, fixtureOptions?: FixtureOpt) {

		const renderObjectPosition: Vec2 = renderObject.GetPosition().SaveConvertPixelsToMeters();

		this.physicsWorld2D = physicsWorld2D;
		this.body = new Body(physicsWorld2D.world);
		this.renderObject = renderObject;

		this.body.setPosition(new P_Vec2(renderObjectPosition.x, renderObjectPosition.y));

		if (renderObject instanceof Rectangle) {

			const rectangleCenter = new P_Vec2(renderObject.x + (renderObject.width / 2), renderObject.y + (renderObject.height / 2));

			this.shape = new Box(renderObject.width, renderObject.height, rectangleCenter, 0);
		}

		this.fixture = new Fixture(this.body, this.shape, { ...fixtureOptions });

		physicsWorld2D.rigidBodies.push(this);
	}

	public SetDynamic(): RigidBody2D {

		this.body.setDynamic();

		return this;
	}

	public SetFixture(fixtureDef: FixtureOpt): RigidBody2D {

		this.fixture = new Fixture(this.body, this.shape, fixtureDef);

		return this;
	}

	public ApplyCenterForce(x: number, y: number) {

		this.body.applyForceToCenter(new P_Vec2(x, y));

		return this;
	}

	public Update() {

		const position = this.body.getPosition(),
			angle = this.body.getAngle(),
			convertedPosition = new Vec2(position.x, position.y).SaveConvertMetersToPixels();

		this.renderObject.x = convertedPosition.x;
		this.renderObject.y = convertedPosition.y;
	}
}