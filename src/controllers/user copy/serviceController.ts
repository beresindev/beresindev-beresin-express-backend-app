import { Request, Response } from 'express';
import asyncHandler from '../../handlers/asyncHandler';
import { saveUploadedImages } from '../../handlers/filleHandler';
import { capitalize, capitalizeFirstWord } from '../../helpers/formatStyleHelper';
import imageModel from '../../models/imageModel';
import serviceModel from '../../models/serviceModel';
import subscriptionModel from '../../models/subscriptionModel';
import userModel from '../../models/userModel';
import { parseCurrency, serviceValidationInput } from '../../validations/serviceValidation';

// Fetch user services with images and subscription details
export const getUserServices = asyncHandler(async (req: Request, res: Response) => {
	const userId = (req as any).user.id;

	// Fetch services created by the user
	const services = await serviceModel.findByUserId(userId);

	if (services.length === 0) {
		res.json({ status: 'success', message: 'Jasa belum ada, silahkan upload jasa Anda.', services: [] });
		return;
	}

	// Sort services by ID in ascending order
	const sortedServices = services.sort((a, b) => a.id - b.id);

	// Fetch all service IDs for the user
	const serviceIds = sortedServices.map((service) => service.id);
	const images = await imageModel.findByServiceIds(serviceIds);

	// Fetch subscription details for the user's services
	const subscriptions = await Promise.all(
		serviceIds.map(async (serviceId) => {
			const subscription = await subscriptionModel.findActiveByServiceId(serviceId);
			return subscription
				? {
						service_id: serviceId,
						isSubscription: true,
						boost_name: subscription.boost_name,
						duration: subscription.duration,
						expired_at: new Date(new Date(subscription.updated_at).getTime() + subscription.duration * 24 * 60 * 60 * 1000).toISOString(),
					}
				: { service_id: serviceId, isSubscription: false, boost_name: 'Tidak ada', duration: 'Tidak ada', expired_at: null };
		}),
	);

	// Map the services with their images and subscription details
	const user = await userModel.findById(userId);

	const servicesWithDetails = sortedServices.map((service) => {
		const subscriptionDetail = subscriptions.find((sub) => sub.service_id === service.id);
		const { isSubscription, ...rest } = service; // Exclude isSubscription from top level
		return {
			...rest,
			phone: user?.phone || null,
			images: images.filter((image) => image.service_id === service.id).map((img) => img.image),
			subscription: {
				isSubscription: subscriptionDetail?.isSubscription || false, // Include in subscription details
				boost_name: subscriptionDetail?.boost_name || 'Tidak ada',
				duration: subscriptionDetail?.duration || 'Tidak ada',
				expired_at: subscriptionDetail?.expired_at || null,
			},
		};
	});

	res.json({ status: 'success', services: servicesWithDetails });
});

export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = (req as any).user.id;

	// Fetch the service by ID
	const service = await serviceModel.findById(Number(id));
	if (!service || service.user_id !== userId) {
		res.status(404).json({ status: 'error', message: 'Layanan tidak ditemukan atau Anda tidak memiliki akses.' });
		return; // Explicitly end function execution
	}

	// Fetch images for the service
	const images = await imageModel.findByServiceId(Number(id));

	// Fetch subscription details for the service
	const subscription = await subscriptionModel.findActiveByServiceId(Number(id));

	// Map subscription details
	const subscriptionDetails = subscription
		? {
				isSubscription: true,
				boost_name: subscription.boost_name,
				duration: subscription.duration,
				expired_at: new Date(new Date(subscription.updated_at).getTime() + subscription.duration * 24 * 60 * 60 * 1000).toISOString(),
			}
		: {
				isSubscription: false,
				boost_name: 'Tidak ada',
				duration: 'Tidak ada',
				expired_at: null,
			};

	// Exclude `isSubscription` from the service response
	const { isSubscription, ...rest } = service;

	// Combine service details with images and subscription
	const serviceWithDetails = {
		...rest,
		images: images.map((img) => img.image),
		subscription: subscriptionDetails,
	};

	res.json({ status: 'success', service: serviceWithDetails });
});

// Create new service with images
export const createServiceWithImages = asyncHandler(async (req: Request, res: Response) => {
	const userId = (req as any).user.id;
	const { name_of_service, category_id, description, min_price, max_price } = req.body;

	// Validasi input
	const errors = serviceValidationInput({ name_of_service, category_id, description, min_price, max_price });
	if (errors.length) {
		res.status(400).json({ status: 'error', message: errors.join(' ') });
		return;
	}

	// Format data
	const formattedName = `Jasa ${capitalize(name_of_service)}`;
	const formattedDescription = capitalizeFirstWord(description);

	// Proses file upload
	const files = req.files as Express.Multer.File[];

	// Buat service baru
	const newService = await serviceModel.create({
		user_id: userId,
		name_of_service: formattedName,
		category_id: Number(category_id),
		description: formattedDescription,
		min_price: parseCurrency(min_price),
		max_price: parseCurrency(max_price),
		status: 'pending',
		like_count: 0,
		bookmark_count: 0,
	});

	// Simpan gambar
	const imagePaths = saveUploadedImages(files, newService.id);
	const newImages = await Promise.all(imagePaths.map((imageData) => imageModel.create(imageData)));

	// Ambil detail pengguna
	const user = await userModel.findById(userId);

	// Cek apakah ada subscription aktif
	const subscription = await subscriptionModel.findActiveByServiceId(newService.id);

	const subscriptionDetails = subscription
		? {
				isSubscription: true,
				boost_name: subscription.boost_name,
				duration: subscription.duration,
				expired_at: new Date(new Date(subscription.updated_at).getTime() + subscription.duration * 24 * 60 * 60 * 1000).toISOString(),
			}
		: {
				isSubscription: false,
				boost_name: 'Tidak ada',
				duration: 'Tidak ada',
				expired_at: null,
			};

	// Hapus `isSubscription` dari level teratas sebelum respons
	const { isSubscription, ...serviceWithoutSubscription } = newService;

	// Buat respons dengan struktur yang diinginkan
	res.status(201).json({
		status: 'success',
		service: {
			...serviceWithoutSubscription,
			phone: user?.phone || null,
			images: newImages.map((img) => img.image),
			subscription: subscriptionDetails,
		},
	});
});

// Update existing service with images
export const updateUserService = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = (req as any).user.id;
	const { name_of_service, category_id, description, min_price, max_price } = req.body;

	// Pastikan service ada dan milik user
	const service = await serviceModel.findById(Number(id));
	if (!service || service.user_id !== userId) {
		res.status(403).json({ status: 'error', message: 'Anda tidak diizinkan untuk mengedit layanan ini.' });
		return;
	}

	// Validasi input
	const errors = serviceValidationInput({ name_of_service, category_id, description, min_price, max_price });
	if (errors.length) {
		res.status(400).json({ status: 'error', message: errors.join(' ') });
		return;
	}

	// Format data
	const formattedName = `Jasa ${capitalize(name_of_service)}`;
	const formattedDescription = capitalizeFirstWord(description);

	// Proses file upload
	const files = req.files as Express.Multer.File[];

	// Update data service
	const updatedService = await serviceModel.updateById(Number(id), {
		name_of_service: formattedName,
		category_id: Number(category_id),
		description: formattedDescription,
		min_price: parseCurrency(min_price),
		max_price: parseCurrency(max_price),
	});

	// Update gambar
	await imageModel.deleteByServiceId(service.id);
	const imagePaths = saveUploadedImages(files, service.id);
	const newImages = await Promise.all(imagePaths.map((imageData) => imageModel.create(imageData)));

	// Ambil detail pengguna
	const user = await userModel.findById(userId);

	// Cek apakah ada subscription aktif
	const subscription = await subscriptionModel.findActiveByServiceId(service.id);

	const subscriptionDetails = subscription
		? {
				isSubscription: true,
				boost_name: subscription.boost_name,
				duration: subscription.duration,
				expired_at: new Date(new Date(subscription.updated_at).getTime() + subscription.duration * 24 * 60 * 60 * 1000).toISOString(),
			}
		: {
				isSubscription: false,
				boost_name: 'Tidak ada',
				duration: 'Tidak ada',
				expired_at: null,
			};

	// Hapus `isSubscription` dari level teratas sebelum respons
	const { isSubscription, ...serviceWithoutSubscription } = updatedService || {};

	// Buat respons dengan struktur yang diinginkan
	res.json({
		status: 'success',
		service: {
			...serviceWithoutSubscription,
			phone: user?.phone || null,
			images: newImages.map((img) => img.image),
			subscription: subscriptionDetails,
		},
	});
});

export const deleteUserService = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = (req as any).user.id;

	const service = await serviceModel.findById(Number(id));
	if (!service || service.user_id !== userId) {
		res.status(403).json({ status: 'error', message: 'Anda tidak diizinkan untuk menghapus layanan ini.' });
		return;
	}

	await imageModel.deleteByServiceId(service.id);
	await serviceModel.deleteById(Number(id));

	res.json({ status: 'success', message: 'Layanan berhasil dihapus.' });
});