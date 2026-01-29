<?php

/**
 * RESTful API Endpoint Example - Product Resource CRUD
 * 
 * This example demonstrates best practices for PHP API development including:
 * - RESTful design with proper HTTP methods
 * - PSR-7 compliant responses
 * - JWT authentication
 * - API Resources for consistent response formatting
 * - HATEOAS links
 * - Proper HTTP status codes
 * - Input validation
 * - Error handling
 * - Rate limiting
 * - Pagination
 */

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\StoreProductRequest;
use App\Http\Requests\Api\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductCollection;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Product API Controller
 * 
 * @OA\Tag(name="Products", description="Product management endpoints")
 */
class ProductController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('throttle:60,1'); // Rate limiting: 60 requests per minute
    }
    
    /**
     * List all products with pagination
     * 
     * @OA\Get(
     *     path="/api/v1/products",
     *     summary="Get list of products",
     *     tags={"Products"},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=20)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     ),
     *     security={{"bearerAuth": {}}}
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $products = Product::with('category')
            ->paginate($perPage);
        
        return (new ProductCollection($products))
            ->response()
            ->setStatusCode(200);
    }
    
    /**
     * Get a single product
     * 
     * GET /api/v1/products/{id}
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'reviews'])
            ->findOrFail($id);
        
        return (new ProductResource($product))
            ->response()
            ->setStatusCode(200);
    }
    
    /**
     * Create a new product
     * 
     * POST /api/v1/products
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());
        
        return (new ProductResource($product))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('api.v1.products.show', $product));
    }
    
    /**
     * Update an existing product (full replacement)
     * 
     * PUT /api/v1/products/{id}
     */
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update($request->validated());
        
        return (new ProductResource($product))
            ->response()
            ->setStatusCode(200);
    }
    
    /**
     * Partially update a product
     * 
     * PATCH /api/v1/products/{id}
     */
    public function patch(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0'
        ]);
        
        $product->update($validated);
        
        return (new ProductResource($product))
            ->response()
            ->setStatusCode(200);
    }
    
    /**
     * Delete a product
     * 
     * DELETE /api/v1/products/{id}
     */
    public function destroy(int $id): Response
    {
        $product = Product::findOrFail($id);
        $product->delete();
        
        return response()->noContent(); // 204 No Content
    }
}

// ============================================================================
// API Resource - Response Formatting with HATEOAS
// ============================================================================

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array with HATEOAS links
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => [
                'amount' => $this->price,
                'currency' => 'USD',
                'formatted' => '$' . number_format($this->price, 2)
            ],
            'stock' => $this->stock,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name
            ],
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            
            // HATEOAS links
            'links' => [
                'self' => route('api.v1.products.show', $this->id),
                'category' => route('api.v1.categories.show', $this->category_id),
                'reviews' => route('api.v1.products.reviews.index', $this->id)
            ]
        ];
    }
}

